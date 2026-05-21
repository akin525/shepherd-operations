"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2, RefreshCw, Shield, Sparkles } from "lucide-react";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Person = {
  id: number;
  name: string;
  email?: string;
};

type Client = {
  id: number;
  name: string;
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

  if (obj && Array.isArray(obj.supervisors)) return obj.supervisors as T[];
  return [];
}

function normalizePerson(input: unknown): Person {
  const obj = asObject(input);
  return {
    id: Number(obj?.id),
    name: String(obj?.name ?? "Unnamed"),
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
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [supervisors, setSupervisors] = useState<Person[]>([]);

  const [selectedClientId, setSelectedClientId] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [phone, setPhone] = useState("");

  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const parseMessage = (payload: unknown, fallback: string) => {
    const obj = asObject(payload);
    return String(obj?.message ?? fallback);
  };

  const fetchClients = useCallback(async () => {
    if (!token) return;

    setLoadingPage(true);
    try {
      const clientsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/operations/client`, {
        headers: authHeaders,
      });

      const clientsJson: unknown = await clientsRes.json().catch(() => ({}));
      setClients(toArray(clientsJson).map(normalizeClient).filter((c) => Number.isFinite(c.id)));

      if (!clientsRes.ok) {
        toast.error(parseMessage(clientsJson, "Failed to load clients."));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load clients.");
    } finally {
      setLoadingPage(false);
    }
  }, [authHeaders, token]);

  const fetchSupervisors = useCallback(async () => {
    if (!token || !selectedClientId) {
      setSupervisors([]);
      return;
    }

    setLoadingSupervisors(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/operations/supervisors?client_id=${encodeURIComponent(selectedClientId)}`,
        { headers: authHeaders },
      );

      const json: unknown = await res.json().catch(() => ({}));
      setSupervisors(toArray(json).map(normalizePerson).filter((s) => Number.isFinite(s.id)));

      if (!res.ok) {
        toast.error(parseMessage(json, "Failed to load supervisors."));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load supervisors.");
    } finally {
      setLoadingSupervisors(false);
    }
  }, [authHeaders, selectedClientId, token]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    fetchSupervisors();
  }, [fetchSupervisors]);

  async function handleCreateSupervisor() {
    if (!selectedClientId) {
      toast.error("Select a client first.");
      return;
    }

    if (!name.trim() || !email.trim() || !password || !passwordConfirmation) {
      toast.error("Name, email, password and password confirmation are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/operations/supervisors`, {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation: passwordConfirmation,
          client_id: Number(selectedClientId),
          phone: phone.trim() || null,
        }),
      });

      const json: unknown = await res.json().catch(() => ({}));
      const obj = asObject(json);
      const ok = res.ok && (obj?.status === undefined || obj?.status === true);

      if (!ok) {
        toast.error(parseMessage(json, "Failed to create supervisor."));
        return;
      }

      toast.success(parseMessage(json, "Supervisor created successfully."));
      setName("");
      setEmail("");
      setPassword("");
      setPasswordConfirmation("");
      setPhone("");
      await fetchSupervisors();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create supervisor.");
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
          <div className="space-y-4">
            <Badge className="bg-[#1f2937] dark:bg-[#FAB435] dark:text-slate-900 text-white border-transparent">
              <Sparkles className="h-3 w-3" />
              Operations Console
            </Badge>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[#1f2937] dark:text-white">
                Supervisor Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
                Create supervisors and view supervisors by client.
              </p>
            </div>
            <Badge
              variant="outline"
              className="border-amber-300 dark:border-amber-400/40 text-amber-900 dark:text-amber-200 dark:bg-amber-950/30"
            >
              Client: {selectedClientId || "Not selected"}
            </Badge>
          </div>
        </div>
      </section>

      <Card className="border border-amber-100/80 dark:border-amber-400/20 dark:bg-slate-900/80 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2 text-[#1f2937] dark:text-white">
            <Shield className="h-4 w-4" />
            Select Client
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSupervisors}
            disabled={loadingSupervisors || !selectedClientId}
            className="gap-2"
          >
            {loadingSupervisors ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh Supervisors
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-w-md">
            <Label>Client</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
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
        </CardContent>
      </Card>

      <Card className="border border-blue-100/80 dark:border-blue-400/20 dark:bg-slate-900/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-[#1f2937] dark:text-white">Create Supervisor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Supervisor name"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Supervisor email"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Password Confirmation</Label>
              <Input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Confirm password"
                className="h-11"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Phone (optional)</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Supervisor phone"
                className="h-11"
              />
            </div>
          </div>

          <Button
            onClick={handleCreateSupervisor}
            disabled={submitting || !selectedClientId}
            className="bg-[#FAB435] hover:bg-[#d99820] text-white"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create Supervisor
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-emerald-100/80 dark:border-emerald-400/20 dark:bg-slate-900/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-[#1f2937] dark:text-white">
            Supervisors For Selected Client ({supervisors.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingPage || loadingSupervisors ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#FAB435]" />
            </div>
          ) : !selectedClientId ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-gray-500 dark:text-slate-400 text-center">
              Select a client to view supervisors.
            </div>
          ) : supervisors.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-gray-500 dark:text-slate-400 text-center">
              No supervisors found for this client.
            </div>
          ) : (
            supervisors.map((supervisor) => (
              <div
                key={supervisor.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/70 p-3"
              >
                <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-200 grid place-items-center text-xs font-bold">
                  {getInitials(supervisor.name)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#1f2937] dark:text-white">{supervisor.name}</p>
                  {supervisor.email ? (
                    <p className="text-xs text-gray-500 dark:text-slate-400">{supervisor.email}</p>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
