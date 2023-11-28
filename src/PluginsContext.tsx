import { PluginFrame } from "plugin-frame";
import React from "react";
import {
  Feed,
  GetFeedRequest,
  GetPublicationRequest,
  GetPublicationResponse,
  PluginInfo,
  SearchRequest,
} from "./plugintypes";

export interface PluginMethodInterface {
  onGetPublication(
    request: GetPublicationRequest
  ): Promise<GetPublicationResponse>;
  onGetFeed(request: GetFeedRequest): Promise<Feed>;
  onSearch(request: SearchRequest): Promise<Feed>;
  onUiMessage(message: any): Promise<void>;
  onPostLogin(): Promise<void>;
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

const PluginsContext = React.createContext<PluginContextInterface>(undefined!);
export default PluginsContext;
