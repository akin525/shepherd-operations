import { Switch } from "@/components/ui/switch";
const Security = () => {
  return (
    <div className="bg-primary-foreground py-6 rounded-lg shadow">
      <h2 className="text-[16px]  font-bold mb-4 px-3 lg:px-6">Security</h2>
      <hr />
      <div className="px-3 lg:px-6 pt-2">
        <div className="flex justify-between">
          <p className="text-[14px] font-medium text-[#3A3A3A] dark:text-[#979797]">
            Two-Factor Authentication
          </p>
          <Switch />
        </div>

        <p className="text-[#979797] dark:text-white font-regular text-[14px]">
          Enable two-factor authentification to add an extra layer of security
          to your account. When you log in, we’ll send a 6-digit code to your
          email that you’ll have to enter to verify it’s you.
        </p>
      </div>
    </div>
  );
};

export default Security;
