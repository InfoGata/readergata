import { PluginFrame } from "plugin-frame";
import React from "react";
import {
  Feed,
  GetFeedRequest,
  GetPublicationRequest,
  GetPublicationResponse,
  PluginInfo,
  SearchRequest,
  Theme,
} from "./plugintypes";

export interface PluginMethodInterface {
  onGetPublication(
    request: GetPublicationRequest
  ): Promise<GetPublicationResponse>;
  onGetFeed(request: GetFeedRequest): Promise<Feed>;
  onSearch(request: SearchRequest): Promise<Feed>;
  onUiMessage(message: any): Promise<void>;
  onPostLogin(): Promise<void>;
  onPostLogout(): Promise<void>;
  onChangeTheme(theme: Theme): Promise<void>;
}

export interface PluginMessage {
  pluginId?: string;
  message: any;
}

export class PluginFrameContainer extends PluginFrame<PluginMethodInterface> {
  name?: string;
  id?: string;
  hasOptions?: boolean;
  fileList?: FileList;
  optionsSameOrigin?: boolean;
  version?: string;
  manifestUrl?: string;
}

export interface PluginContextInterface {
  addPlugin: (plugin: PluginInfo, pluginFiles?: FileList) => Promise<void>;
  updatePlugin: (
    plugin: PluginInfo,
    id: string,
    pluginFiles?: FileList
  ) => Promise<void>;
  deletePlugin: (plugin: PluginFrameContainer) => Promise<void>;
  plugins: PluginFrameContainer[];
  pluginMessage?: PluginMessage;
  pluginsLoaded: boolean;
  pluginsFailed: boolean;
  preinstallComplete: boolean;
  reloadPlugins: () => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const PluginsContext = React.createContext<PluginContextInterface>(undefined!);
export default PluginsContext;
