import { PluginDescription } from "@/default-plugins";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";

type Props = {
  plugin: PluginDescription;
  addPlugin: (description: PluginDescription) => Promise<void>;
};

const PluginCard = (props: Props) => {
  const { plugin, addPlugin } = props;
  const onClickAdd = () => {
    addPlugin(plugin);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{plugin.name}</CardTitle>
        <CardDescription>{plugin.description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="uppercase" onClick={onClickAdd}>
          Add
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PluginCard;
