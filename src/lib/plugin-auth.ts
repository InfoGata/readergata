import { db } from "../database";
import { PluginInfo } from "../plugintypes";
import { hasAuthentication } from "../utils";

/**
 * Whether a plugin has a stored login: the platform can run a login flow, the
 * plugin declares one, and it has completed. The row is what the login flow
 * writes, so its presence is the answer -- not the pending read of it, which
 * is always truthy and made every authenticated plugin look logged in.
 */
export const isPluginLoggedIn = async (
  plugin: Pick<PluginInfo, "id" | "manifest">
): Promise<boolean> => {
  if (!plugin.id || !plugin.manifest?.authentication) return false;
  if (!(await hasAuthentication())) return false;
  return !!(await db.pluginAuths.get(plugin.id));
};
