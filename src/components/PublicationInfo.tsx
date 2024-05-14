import DOMPurify from "dompurify";
import React from "react";
import { Publication } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";
import PublicationSourceButton from "./PublicationSourceButton";
import { Dialog, DialogContent } from "./ui/dialog";
import AboutLink from "./AboutLink";

interface PublicationInfoProps {
  publication: Publication;
}

const PublicationInfo: React.FC<PublicationInfoProps> = (props) => {
  const { publication } = props;
  const sanitizer = DOMPurify.sanitize;
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const toggleDialogOpen = () => {
    setDialogOpen(!dialogOpen);
  };

  const icon = getThumbnailImage(publication?.images, searchThumbnailSize);
  const authors = publication.authors?.map((a) => a.name).join(", ");

  return (
    <>
      <AboutLink
        title={publication.title}
        description={publication.authors?.map((a) => a.name).join(", ")}
        avatarSrc={icon}
        action={toggleDialogOpen}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="overflow-y-scroll max-h-screen">
          <div className="flex flex-col justify-center items-center">
            <img alt="" src={icon} height={225} width={125} />
            <h2 className="text-3xl font-bold">{publication.title}</h2>
            <h3 className="text-lg font-semibold">{authors}</h3>
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizer(publication.summary || ""),
              }}
            />
            <div className="flex flex-col gap-2">
              {publication.sources?.map((s, i) => (
                <PublicationSourceButton
                  key={i}
                  source={s}
                  pluginId={publication.pluginId}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PublicationInfo;
