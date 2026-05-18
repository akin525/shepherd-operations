"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Loader2,
  RefreshCw,
  UserCheck,
  UserMinus,
  UserPlus2,
  Repeat2,
  Search,
  Users,
  Shield,
  Sparkles,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Person = {
  id: number;
  name: string;
  email?: string;
};

type Client = {
  id: number;
  name: string;
};

type QuickAction = {
  type: "assign" | "unassign";
  guard: Person;
};

function asObject(input: unknown): Record<string, unknown> | null {
  if (typeof input === "object" && input !== null) return input as Record<string, unknown>;
  return null;
}

function toArray<T = unknown>(payload: unknown): T[] {
  const obj = asObject(payload);
  if (Array.isArray(payload)) return payload;
  if (obj && Array.isArray(obj.data)) return obj.data as T[];

  const nestedData = obj ? asObject(obj.data) : null;
  if (nestedData && Array.isArray(nestedData.data)) return nestedData.data as T[];

  if (obj && Array.isArray(obj.guards)) return obj.guards as T[];
  if (obj && Array.isArray(obj.supervisors)) return obj.supervisors as T[];
  return [];
}

function normalizePerson(input: unknown): Person {
  const obj = asObject(input);
  return {
    id: Number(obj?.id),
    name: String(obj?.name ?? obj?.full_name ?? "Unnamed"),
    email: obj?.email ? String(obj.email) : undefined,
  };
}

function normalizeClient(input: unknown): Client {
  const obj = asObject(input);
  return {
    id: Number(obj?.id),
    name: String(obj?.name ?? "Unnamed Client"),
  };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export default function SupervisorAssignmentPage() {
  const { token } = useAuth();

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingLists, setLoadingLists] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [supervisors, setSupervisors] = useState<Person[]>([]);

  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [manualSupervisorId, setManualSupervisorId] = useState("");

  const [assignedGuards, setAssignedGuards] = useState<Person[]>([]);
  const [unassignedGuards, setUnassignedGuards] = useState<Person[]>([]);

  const [pickedAssigned, setPickedAssigned] = useState<Record<number, boolean>>({});
  const [pickedUnassigned, setPickedUnassigned] = useState<Record<number, boolean>>({});

  const [unassignedSearch, setUnassignedSearch] = useState("");
  const [assignedSearch, setAssignedSearch] = useState("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [quickActionModalOpen, setQuickActionModalOpen] = useState(false);

  const [newSupervisorName, setNewSupervisorName] = useState("");
  const [newSupervisorEmail, setNewSupervisorEmail] = useState("");

  const [reassignGuardId, setReassignGuardId] = useState("");
  const [reassignTargetSupervisorId, setReassignTargetSupervisorId] = useState("");

  const [quickAction, setQuickAction] = useState<QuickAction | null>(null);

  const activeSupervisorId = useMemo(
    () => (selectedSupervisorId || manualSupervisorId).trim(),
    [selectedSupervisorId, manualSupervisorId],
  );

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const filteredUnassigned = useMemo(() => {
    const q = unassignedSearch.trim().toLowerCase();
    if (!q) return unassignedGuards;
    return unassignedGuards.filter((g) => g.name.toLowerCase().includes(q));
  }, [unassignedGuards, unassignedSearch]);

  const filteredAssigned = useMemo(() => {
    const q = assignedSearch.trim().toLowerCase();
    if (!q) return assignedGuards;
    return assignedGuards.filter((g) => g.name.toLowerCase().includes(q));
  }, [assignedGuards, assignedSearch]);

  const selectedUnassignedCount = useMemo(
    () => Object.values(pickedUnassigned).filter(Boolean).length,
    [pickedUnassigned],
  );

  const selectedAssignedCount = useMemo(
    () => Object.values(pickedAssigned).filter(Boolean).length,
    [pickedAssigned],
  );

  const allVisibleUnassignedSelected = useMemo(
    () =>
      filteredUnassigned.length > 0 &&
      filteredUnassigned.every((guard) => Boolean(pickedUnassigned[guard.id])),
    [filteredUnassigned, pickedUnassigned],
  );

  const allVisibleAssignedSelected = useMemo(
    () =>
      filteredAssigned.length > 0 &&
      filteredAssigned.every((guard) => Boolean(pickedAssigned[guard.id])),
    [filteredAssigned, pickedAssigned],
  );

  const parseMessage = (payload: unknown, fallback: string) => {
    const obj = asObject(payload);
    return String(obj?.message ?? fallback);
  };

  const postOperations = useCallback(
    async (path: string, body: Record<string, unknown>) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/operations${path}`, {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const json: unknown = await res.json().catch(() => ({}));
      const obj = asObject(json);
      const ok = res.ok && (obj?.status === undefined || obj?.status === true);

      return {
        ok,
        json,
        message: parseMessage(json, ok ? "Successful" : "Request failed"),
      };
    },
    [authHeaders],
  );

  const fetchBaseData = useCallback(async () => {
    if (!token) return;

    setLoadingPage(true);
    try {
      const clientsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/operations/client`, {
        headers: authHeaders,
      });

      const clientsJson: unknown = await clientsRes.json().catch(() => ({}));
      setClients(toArray(clientsJson).map(normalizeClient).filter((c) => Number.isFinite(c.id)));

      if (!clientsRes.ok) toast.error(parseMessage(clientsJson, "Failed to load clients."));

      if (!selectedClientId) {
        setSupervisors([]);
        setSelectedSupervisorId("");
        return;
      }

      const supervisorsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/operations/supervisors?client_id=${encodeURIComponent(selectedClientId)}`,
        { headers: authHeaders },
      );
      const supervisorsJson: unknown = await supervisorsRes.json().catch(() => ({}));
      const loadedSupervisors = toArray(supervisorsJson)
        .map(normalizePerson)
        .filter((s) => Number.isFinite(s.id));
      setSupervisors(loadedSupervisors);

      setSelectedSupervisorId((prev) =>
        prev && !loadedSupervisors.some((s) => String(s.id) === prev) ? "" : prev,
      );

      if (!supervisorsRes.ok) toast.error(parseMessage(supervisorsJson, "Failed to load supervisors."));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load assignment base data.");
    } finally {
      setLoadingPage(false);
    }
  }, [authHeaders, token, selectedClientId]);

  const fetchGuardLists = useCallback(async () => {
    if (!token || !selectedClientId || !activeSupervisorId) {
      setAssignedGuards([]);
      setUnassignedGuards([]);
      return;
    }

    setLoadingLists(true);
    try {
      const [assignedRes, unassignedRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/operations/supervisors/${activeSupervisorId}/guards`,
          { headers: authHeaders },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/operations/guards/unassigned?client_id=${encodeURIComponent(selectedClientId)}`,
          { headers: authHeaders },
        ),
      ]);

      const assignedJson: unknown = await assignedRes.json().catch(() => ({}));
      const unassignedJson: unknown = await unassignedRes.json().catch(() => ({}));

      setAssignedGuards(
        toArray(assignedJson).map(normalizePerson).filter((g) => Number.isFinite(g.id)),
      );
      setUnassignedGuards(
        toArray(unassignedJson).map(normalizePerson).filter((g) => Number.isFinite(g.id)),
      );

      setPickedAssigned({});
      setPickedUnassigned({});

      if (!assignedRes.ok) toast.error(parseMessage(assignedJson, "Failed to load supervisor guards."));
      if (!unassignedRes.ok) toast.error(parseMessage(unassignedJson, "Failed to load unassigned guards."));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load guard assignment lists.");
    } finally {
      setLoadingLists(false);
    }
  }, [activeSupervisorId, authHeaders, selectedClientId, token]);

  useEffect(() => {
    fetchBaseData();
  }, [fetchBaseData]);

  useEffect(() => {
    fetchGuardLists();
  }, [fetchGuardLists]);

  const buildAssignPayload = (guardId: number, supervisorId: number) => ({
    guard_id: guardId,
    supervisor_id: supervisorId,
    client_id: selectedClientId ? Number(selectedClientId) : undefined,
  });

  async function handleCreateSupervisor() {
    if (!newSupervisorName.trim()) {
      toast.error("Supervisor name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = { name: newSupervisorName.trim() };
      if (newSupervisorEmail.trim()) payload.email = newSupervisorEmail.trim();

      const result = await postOperations("/supervisors", payload);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message || "Supervisor created.");
      setNewSupervisorName("");
      setNewSupervisorEmail("");
      setCreateModalOpen(false);
      await fetchBaseData();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAssignOne(guardId: number) {
    if (!activeSupervisorId) {
      toast.error("Select a supervisor first.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await postOperations(
        "/supervisors/assign-guard",
        buildAssignPayload(guardId, Number(activeSupervisorId)),
      );

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message || "Guard assigned.");
      setQuickActionModalOpen(false);
      setQuickAction(null);
      await fetchGuardLists();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnassignOne(guardId: number) {
    if (!activeSupervisorId) {
      toast.error("Select a supervisor first.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await postOperations(
        "/supervisors/unassign-guard",
        buildAssignPayload(guardId, Number(activeSupervisorId)),
      );

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message || "Guard unassigned.");
      setQuickActionModalOpen(false);
      setQuickAction(null);
      await fetchGuardLists();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBulkAssign() {
    if (!activeSupervisorId) {
      toast.error("Select a supervisor first.");
      return;
    }

    const guardIds = Object.entries(pickedUnassigned)
      .filter(([, checked]) => checked)
      .map(([id]) => Number(id));

    if (!guardIds.length) {
      toast.error("Select at least one unassigned guard.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await postOperations("/supervisors/assign-guards/bulk", {
        guard_ids: guardIds,
        supervisor_id: Number(activeSupervisorId),
        client_id: selectedClientId ? Number(selectedClientId) : undefined,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message || "Guards assigned in bulk.");
      await fetchGuardLists();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBulkUnassign() {
    if (!activeSupervisorId) {
      toast.error("Select a supervisor first.");
      return;
    }

    const guardIds = Object.entries(pickedAssigned)
      .filter(([, checked]) => checked)
      .map(([id]) => Number(id));

    if (!guardIds.length) {
      toast.error("Select at least one assigned guard.");
      return;
    }

    setSubmitting(true);
    try {
      for (const guardId of guardIds) {
        const result = await postOperations(
          "/supervisors/unassign-guard",
          buildAssignPayload(guardId, Number(activeSupervisorId)),
        );
        if (!result.ok) {
          toast.error(result.message);
          return;
        }
      }

      toast.success("Selected guards unassigned.");
      await fetchGuardLists();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReassign() {
    if (!reassignGuardId || !activeSupervisorId || !reassignTargetSupervisorId) {
      toast.error("Pick guard, current supervisor, and target supervisor.");
      return;
    }

    if (reassignTargetSupervisorId === activeSupervisorId) {
      toast.error("Target supervisor must be different.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await postOperations("/supervisors/reassign-guard", {
        guard_id: Number(reassignGuardId),
        from_supervisor_id: Number(activeSupervisorId),
        to_supervisor_id: Number(reassignTargetSupervisorId),
        client_id: selectedClientId ? Number(selectedClientId) : undefined,
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message || "Guard reassigned.");
      setReassignGuardId("");
      setReassignTargetSupervisorId("");
      setReassignModalOpen(false);
      await fetchGuardLists();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8 pb-10 space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-amber-200/60 dark:border-amber-500/20 bg-gradient-to-br from-amber-50 via-white to-orange-100/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 shadow-sm">
        <div className="pointer-events-none absolute -top-16 -right-12 h-44 w-44 rounded-full bg-[#FAB435]/25 dark:bg-[#FAB435]/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-36 w-36 rounded-full bg-orange-300/20 dark:bg-cyan-500/10 blur-2xl" />
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <Badge className="bg-[#1f2937] dark:bg-[#FAB435] dark:text-slate-900 text-white border-transparent">
                <Sparkles className="h-3 w-3" />
                Operations Console
              </Badge>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[#1f2937] dark:text-white">
                  Supervisor Assignment
                </h1>
                <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
                  Route guards cleanly across supervisors with focused, modal-based actions.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="border-amber-300 dark:border-amber-400/40 text-amber-900 dark:text-amber-200 dark:bg-amber-950/30"
                >
                  Client: {selectedClientId || "Not selected"}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-amber-300 dark:border-amber-400/40 text-amber-900 dark:text-amber-200 dark:bg-amber-950/30"
                >
                  Supervisor: {activeSupervisorId || "Not selected"}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="gap-2 border-[#1f2937]/20 dark:border-slate-600 text-[#1f2937] dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setReassignModalOpen(true)}
              >
                <Repeat2 className="h-4 w-4" />
                Reassign Guard
              </Button>
              <Button
                className="gap-2 bg-[#FAB435] hover:bg-[#d99820] text-white"
                onClick={() => setCreateModalOpen(true)}
              >
                <UserPlus2 className="h-4 w-4" />
                New Supervisor
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-amber-100/80 dark:border-amber-400/20 bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-900 dark:to-slate-800 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Supervisors</p>
                <p className="text-3xl font-black text-[#1f2937] dark:text-white mt-1">{supervisors.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-[#1f2937] dark:bg-amber-400 dark:text-slate-900 text-white grid place-items-center">
                <Shield className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-emerald-100/80 dark:border-emerald-400/20 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-900 dark:to-slate-800 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Assigned</p>
                <p className="text-3xl font-black text-[#1f2937] dark:text-white mt-1">{assignedGuards.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white grid place-items-center">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-100/80 dark:border-blue-400/20 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-slate-800 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Unassigned</p>
                <p className="text-3xl font-black text-[#1f2937] dark:text-white mt-1">{unassignedGuards.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-600 text-white grid place-items-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-amber-100/70 dark:border-amber-400/20 dark:bg-slate-900/80 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-lg text-[#1f2937] dark:text-white">Assignment Context</CardTitle>
            <Button
              variant="outline"
              className="gap-2 self-start md:self-auto"
              onClick={fetchGuardLists}
              disabled={loadingPage || loadingLists || !selectedClientId || !activeSupervisorId}
            >
              {loadingLists ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh Lists
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select
                value={selectedClientId}
                onValueChange={(value) => {
                  setSelectedClientId(value);
                  setSelectedSupervisorId("");
                  setManualSupervisorId("");
                  setAssignedGuards([]);
                  setUnassignedGuards([]);
                  setPickedAssigned({});
                  setPickedUnassigned({});
                }}
              >
                <SelectTrigger className="w-full h-11 bg-white/80 dark:bg-slate-800/90 dark:border-slate-700">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Supervisor</Label>
              <Select
                value={selectedSupervisorId}
                onValueChange={(v) => {
                  setSelectedSupervisorId(v);
                  setManualSupervisorId("");
                }}
              >
                <SelectTrigger className="w-full h-11 bg-white/80 dark:bg-slate-800/90 dark:border-slate-700">
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.length > 0 ? (
                    supervisors.map((supervisor) => (
                      <SelectItem key={supervisor.id} value={String(supervisor.id)}>
                        {supervisor.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No supervisors for selected client
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Or Supervisor ID</Label>
              <Input
                value={manualSupervisorId}
                onChange={(e) => {
                  setSelectedSupervisorId("");
                  setManualSupervisorId(e.target.value);
                }}
                placeholder="Enter supervisor id"
                className="h-11 bg-white/80 dark:bg-slate-800/90 dark:border-slate-700"
              />
            </div>
          </div>

          {(!selectedClientId || !activeSupervisorId) && (
            <div className="rounded-lg border border-dashed border-amber-300 dark:border-amber-400/30 bg-amber-50/60 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
              Select both a client and supervisor to load assignment lists.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-blue-100/80 dark:border-blue-400/20 dark:bg-slate-900/80 shadow-sm overflow-hidden">
          <CardHeader className="space-y-3 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-[#1f2937] dark:text-white">
                <Users className="h-4 w-4" />
                Unassigned Guards
                <Badge variant="outline" className="ml-1 dark:border-blue-300/30 dark:text-blue-200">
                  {filteredUnassigned.length}
                </Badge>
              </CardTitle>
              <Button
                onClick={handleBulkAssign}
                disabled={submitting || selectedUnassignedCount === 0}
                className="bg-[#FAB435] hover:bg-[#d99820] text-white dark:text-slate-900 gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Bulk Assign ({selectedUnassignedCount})
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input
                value={unassignedSearch}
                onChange={(e) => setUnassignedSearch(e.target.value)}
                placeholder="Search unassigned guards"
                className="pl-9 h-11 bg-white dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setPickedUnassigned((prev) => {
                  const next = { ...prev };
                  const value = !allVisibleUnassignedSelected;
                  for (const guard of filteredUnassigned) next[guard.id] = value;
                  return next;
                })
              }
              className="text-xs font-medium text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200 w-fit"
            >
              {allVisibleUnassignedSelected ? "Clear visible selection" : "Select all visible"}
            </button>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[480px] overflow-auto p-4">
            {loadingPage || loadingLists ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#FAB435]" />
              </div>
            ) : filteredUnassigned.length === 0 ? (
              <div className="rounded-lg border border-dashed dark:border-slate-700 p-6 text-sm text-gray-500 dark:text-slate-400 text-center">
                No unassigned guards found.
              </div>
            ) : (
              filteredUnassigned.map((guard) => (
                <div
                  key={guard.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/70 p-3 hover:border-blue-200 dark:hover:border-blue-500/40 hover:shadow-sm transition-all"
                >
                  <label className="flex min-w-0 items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={Boolean(pickedUnassigned[guard.id])}
                      onCheckedChange={(checked) =>
                        setPickedUnassigned((prev) => ({ ...prev, [guard.id]: Boolean(checked) }))
                      }
                    />
                    <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 grid place-items-center text-xs font-bold">
                      {getInitials(guard.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#1f2937] dark:text-white truncate">
                        {guard.name}
                      </p>
                      {guard.email ? (
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{guard.email}</p>
                      ) : null}
                    </div>
                  </label>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setQuickAction({ type: "assign", guard });
                      setQuickActionModalOpen(true);
                    }}
                    disabled={submitting}
                  >
                    Assign
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border border-emerald-100/80 dark:border-emerald-400/20 dark:bg-slate-900/80 shadow-sm overflow-hidden">
          <CardHeader className="space-y-3 bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-900/20 dark:to-transparent">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-[#1f2937] dark:text-white">
                <Users className="h-4 w-4" />
                Assigned Guards
                <Badge variant="outline" className="ml-1 dark:border-emerald-300/30 dark:text-emerald-200">
                  {filteredAssigned.length}
                </Badge>
              </CardTitle>
              <Button
                variant="outline"
                onClick={handleBulkUnassign}
                disabled={submitting || selectedAssignedCount === 0}
                className="gap-2 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              >
                <UserMinus className="h-4 w-4" />
                Bulk Unassign ({selectedAssignedCount})
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input
                value={assignedSearch}
                onChange={(e) => setAssignedSearch(e.target.value)}
                placeholder="Search assigned guards"
                className="pl-9 h-11 bg-white dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setPickedAssigned((prev) => {
                  const next = { ...prev };
                  const value = !allVisibleAssignedSelected;
                  for (const guard of filteredAssigned) next[guard.id] = value;
                  return next;
                })
              }
              className="text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-200 w-fit"
            >
              {allVisibleAssignedSelected ? "Clear visible selection" : "Select all visible"}
            </button>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[480px] overflow-auto p-4">
            {loadingPage || loadingLists ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#FAB435]" />
              </div>
            ) : filteredAssigned.length === 0 ? (
              <div className="rounded-lg border border-dashed dark:border-slate-700 p-6 text-sm text-gray-500 dark:text-slate-400 text-center">
                No guards assigned to this supervisor.
              </div>
            ) : (
              filteredAssigned.map((guard) => (
                <div
                  key={guard.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/70 p-3 hover:border-emerald-200 dark:hover:border-emerald-500/40 hover:shadow-sm transition-all"
                >
                  <label className="flex min-w-0 items-center gap-3 cursor-pointer">
                    <Checkbox
                      checked={Boolean(pickedAssigned[guard.id])}
                      onCheckedChange={(checked) =>
                        setPickedAssigned((prev) => ({ ...prev, [guard.id]: Boolean(checked) }))
                      }
                    />
                    <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200 grid place-items-center text-xs font-bold">
                      {getInitials(guard.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[#1f2937] dark:text-white truncate">
                        {guard.name}
                      </p>
                      {guard.email ? (
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{guard.email}</p>
                      ) : null}
                    </div>
                  </label>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setQuickAction({ type: "unassign", guard });
                      setQuickActionModalOpen(true);
                    }}
                    disabled={submitting}
                  >
                    Unassign
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden dark:border-slate-700 dark:bg-slate-900">
          <div className="bg-gradient-to-r from-[#1f2937] to-[#374151] dark:from-slate-800 dark:to-slate-700 px-6 py-5 text-white">
            <DialogHeader>
              <DialogTitle>Create Supervisor</DialogTitle>
              <DialogDescription className="text-gray-200">
                Add a new supervisor record for deployment assignment.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-5 space-y-4 dark:bg-slate-900">
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Name</Label>
              <Input
                value={newSupervisorName}
                onChange={(e) => setNewSupervisorName(e.target.value)}
                placeholder="Supervisor name"
                className="dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Email (optional)</Label>
              <Input
                value={newSupervisorEmail}
                onChange={(e) => setNewSupervisorEmail(e.target.value)}
                placeholder="Supervisor email"
                className="dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateSupervisor}
                disabled={submitting}
                className="bg-[#FAB435] hover:bg-[#d99820] text-white"
              >
                Create
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={reassignModalOpen} onOpenChange={setReassignModalOpen}>
        <DialogContent className="sm:max-w-[540px] dark:border-slate-700 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Repeat2 className="h-4 w-4" />
              Reassign Guard
            </DialogTitle>
            <DialogDescription>
              Move a guard from the current supervisor to another one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Guard</Label>
              <Select value={reassignGuardId} onValueChange={setReassignGuardId}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                  <SelectValue placeholder="Select assigned guard" />
                </SelectTrigger>
                <SelectContent>
                  {assignedGuards.map((guard) => (
                    <SelectItem key={guard.id} value={String(guard.id)}>
                      {guard.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-slate-200">Target Supervisor</Label>
              <Select
                value={reassignTargetSupervisorId}
                onValueChange={setReassignTargetSupervisorId}
              >
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                  <SelectValue placeholder="Select target supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors
                    .filter((s) => String(s.id) !== activeSupervisorId)
                    .map((supervisor) => (
                      <SelectItem key={supervisor.id} value={String(supervisor.id)}>
                        {supervisor.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReassign} disabled={submitting}>
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={quickActionModalOpen} onOpenChange={setQuickActionModalOpen}>
        <DialogContent className="sm:max-w-[460px] dark:border-slate-700 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>
              {quickAction?.type === "assign" ? "Assign Guard" : "Unassign Guard"}
            </DialogTitle>
            <DialogDescription>
              {quickAction?.type === "assign"
                ? "Confirm assignment of this guard to the selected supervisor."
                : "Confirm unassignment of this guard from the selected supervisor."}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-100 grid place-items-center text-xs font-bold">
              {quickAction ? getInitials(quickAction.guard.name) : "--"}
            </div>
            <div>
              <p className="font-semibold text-sm text-[#1f2937] dark:text-white">
                {quickAction?.guard.name ?? "-"}
              </p>
              {quickAction?.guard.email ? (
                <p className="text-xs text-gray-500">{quickAction.guard.email}</p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setQuickActionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!quickAction) return;
                if (quickAction.type === "assign") {
                  void handleAssignOne(quickAction.guard.id);
                  return;
                }
                void handleUnassignOne(quickAction.guard.id);
              }}
              disabled={submitting || !quickAction}
              className={
                quickAction?.type === "assign" ? "bg-[#FAB435] hover:bg-[#d99820] text-white" : ""
              }
            >
              {quickAction?.type === "assign" ? "Assign" : "Unassign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
