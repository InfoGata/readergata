import React from "react";
import { Filter } from "../plugintypes";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface FilterComponentProps {
  filter: Filter;
  value: string;
  onValueChange: (id: string, value: string) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = (props) => {
  const { filter, value, onValueChange } = props;

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(filter.id, event.currentTarget.value);
  };

  const onChange = (newValue: string) => {
    onValueChange(filter.id, newValue);
  };

  switch (filter.type) {
    case "radio":
      return (
        <div className="flex flex-col gap-2">
          <Label>{filter.displayName}</Label>
          <RadioGroup
            value={value}
            name={filter.id}
            onValueChange={onChange}
            className="flex flex-wrap gap-3"
          >
            {filter.options?.map((option) => {
              const optionId = `${filter.id}-${option.value}`;
              return (
                <div key={option.value} className="flex items-center gap-1">
                  <RadioGroupItem value={option.value} id={optionId} />
                  <Label htmlFor={optionId}>{option.displayName}</Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      );
    case "select":
      return (
        <div className="flex flex-col gap-2">
          <Label htmlFor={filter.id}>{filter.displayName}</Label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger id={filter.id}>
              <SelectValue placeholder={filter.displayName} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    case "text":
      return (
        <div className="flex flex-col gap-2">
          <Label htmlFor={filter.id}>{filter.displayName}</Label>
          <Input id={filter.id} value={value} onChange={onInputChange} />
        </div>
      );
    default:
      return null;
  }
};

export default FilterComponent;
