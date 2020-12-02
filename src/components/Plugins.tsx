import React from "react";
import axios from "axios";
import { BookLinkItem, BookLinkItemUrl } from "../models";
import BookLink from "./BookLink";
import Opds from "./Opds";
import { useDispatch } from "react-redux";
import { setNavigationOpen } from "../reducers/uiReducer";

// const humbleBundleSess = "sfsfs";
const bundleUrl = "https://www.humblebundle.com/api/v1/user/order?ajax=true";
const requestHeaders = {
  Cookie:
    "",
};
const proxiedUrl = `https://cloudcors.audio-pwa.workers.dev?setRequestHeaders=${JSON.stringify(
  requestHeaders
)}&url=`;

interface Bundle {
  gamekey: string;
}

interface Order {
  gamekey: string;
  product: Product;
  subproducts: SubProduct[];
}

interface Product {
  human_name: string;
}

interface SubProduct {
  human_name: string;
  icon: string;
  url: string;
  downloads: Download[];
}

interface Download {
  platform: string
  download_struct: DownloadStruct[];
}

interface DownloadStruct {
  name: string
  human_size: string;
  url: DownloadUrl;
}

interface DownloadUrl {
  web: string;
  bittorrent: string;
}

const getHumbleBundleOrder = async (gamekey: string): Promise<BookLinkItem[]> => {
  const bundleUrl = `https://www.humblebundle.com/api/v1/order/${gamekey}?ajax=true`;
  const orderResponse = await axios.get<Order>(`${proxiedUrl}${bundleUrl}`);
  const filteredDownloads: BookLinkItem[] = orderResponse.data.subproducts
    .filter((sp) => sp.downloads.some((d) => d.platform === "ebook"))
    .map((sp) => ({
      name: sp.human_name,
      icon: sp.icon,
      urls: sp.downloads[0].download_struct.map(
        (d) =>
          ({
            type: d.name,
            url: d.url.web,
            size: d.human_size,
          } as BookLinkItemUrl)
      ),
    }));
  return filteredDownloads;
}

const Plugins: React.FC = () => {
  const [books, setBooks] = React.useState<BookLinkItem[]>([]);
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(setNavigationOpen(false));
  }, [dispatch]);

  const openBundles = async () => {
    const bundleResponse = await axios.get<Bundle[]>(
      `${proxiedUrl}${bundleUrl}`
    );
    if (bundleResponse.status !== 200) {
      return;
    }
    const bundles = bundleResponse.data;
    let promises: Promise<BookLinkItem[]>[] = [];
    for (const bundle of bundles) {
      promises.push(getHumbleBundleOrder(bundle.gamekey));
    }
    const filteredBooks = await Promise.all(promises);
    setBooks(filteredBooks.flat());
  };

  const bookUrls = books.map((b) => (
    <BookLink bookItem={b} />
  ));
  return (
    <div>
      <button onClick={openBundles}>Open Humble Bundle</button>
      {bookUrls}
      <Opds />
    </div>
  );
};

export default Plugins;
