import type { Publication, PublicationSource } from "../../plugintypes";

export interface ViewerTarget {
  source: string;
  type?: string;
  pluginId?: string;
}

export type ChatRef =
  | { kind: "publication"; pluginId: string; publication: Publication }
  | {
      kind: "source";
      pluginId: string;
      title: string;
      source: PublicationSource;
    };

/**
 * Plugin sources are opaque strings the model would have to copy back
 * verbatim, so it only ever sees short refs that resolve to them here.
 */
export class ChatRefs {
  private refs = new Map<string, ChatRef>();
  private next = 1;

  add(ref: ChatRef, prefix = "r"): string {
    const id = `${prefix}${this.next++}`;
    this.refs.set(id, ref);
    return id;
  }

  get(id: string): ChatRef | undefined {
    return this.refs.get(id);
  }

  clear() {
    this.refs.clear();
    this.next = 1;
  }
}
