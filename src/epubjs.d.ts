// eslint-disable-next-line import/no-unresolved
import Section from "epubjs/types/section";

declare module "epubjs/types/section" {
  export default interface Section {
    load: (_request?: Request) => Promise<void>;
    search: (
      _query: string,
      maxSeqEle: number = 5
    ) => Promise<{ cfi: string; excerpt: string }[]>;
  }
}

declare module "epubjs/types/spine" {
  export default interface Spine {
    spineItems: Section[];
  }
}
