import React from "react";
import { useTranslation } from "react-i18next";
import { FilterInfo, FilterValues } from "../plugintypes";
import FilterComponent from "./FilterComponent";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";

interface FilteringProps {
  /** The filters the plugin declared for this feed. */
  filterInfo: FilterInfo;
  /** Values currently applied, taken from the url. */
  values?: FilterValues;
  onApply: (values: FilterValues) => void;
}

/**
 * Values the controls should start on: what the url says, falling back to the
 * value the plugin declared. The plugin reports its effective value, so a
 * filter the user has never touched still shows what the results actually used.
 */
const initialValues = (
  filterInfo: FilterInfo,
  values?: FilterValues,
): FilterValues =>
  Object.fromEntries(
    filterInfo.filters.map((f) => [f.id, values?.[f.id] ?? f.value ?? ""]),
  );

const Filtering: React.FC<FilteringProps> = (props) => {
  const { filterInfo, values, onApply } = props;
  const { t } = useTranslation();
  const [draft, setDraft] = React.useState(() =>
    initialValues(filterInfo, values),
  );

  // Moving to another feed replaces both the declaration and the applied
  // values, so the in-progress draft is no longer about anything.
  const appliedKey = JSON.stringify([
    filterInfo.filters.map((f) => f.id),
    values,
  ]);
  React.useEffect(() => {
    setDraft(initialValues(filterInfo, values));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedKey]);

  const onValueChange = (id: string, value: string) => {
    setDraft((current) => ({ ...current, [id]: value }));
  };

  const onSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    onApply(draft);
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="filters">
        <AccordionTrigger>{t("filters")}</AccordionTrigger>
        <AccordionContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filterInfo.filters.map((f) => (
                <FilterComponent
                  key={f.id}
                  filter={f}
                  value={draft[f.id] ?? ""}
                  onValueChange={onValueChange}
                />
              ))}
            </div>
            <div>
              <Button type="submit">{t("applyFilters")}</Button>
            </div>
          </form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default Filtering;
