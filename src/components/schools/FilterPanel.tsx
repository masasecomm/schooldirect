import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { titleCase } from "@/lib/schools";

export interface Filters {
  district: string;
  sector: string;
  phase: string;
  quintile: string;
  town: string;
}

interface Props {
  filters: Filters;
  facets: {
    districts: string[];
    sectors: string[];
    phases: string[];
    quintiles: string[];
    towns: string[];
  };
  onChange: (next: Filters) => void;
  onClear: () => void;
}

const ALL = "__all__";

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
  format = (v: string) => v,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  format?: (v: string) => string;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
    <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? "" : v)}>
      <SelectTrigger className="h-9">
        <SelectValue placeholder={`All ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectItem value={ALL}>All {label.toLowerCase()}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {format(o)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export const FilterPanel = ({ filters, facets, onChange, onClear }: Props) => {
  const set = <K extends keyof Filters>(key: K, value: string) =>
    onChange({ ...filters, [key]: value });

  const hasAny = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filters</h2>
        {hasAny && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-7 text-xs">
            Clear all
          </Button>
        )}
      </div>

      <FilterSelect
        label="District"
        value={filters.district}
        options={facets.districts}
        onChange={(v) => set("district", v)}
        format={titleCase}
      />
      <FilterSelect
        label="Sector"
        value={filters.sector}
        options={facets.sectors}
        onChange={(v) => set("sector", v)}
        format={titleCase}
      />
      <FilterSelect
        label="Phase"
        value={filters.phase}
        options={facets.phases}
        onChange={(v) => set("phase", v)}
        format={titleCase}
      />
      <FilterSelect
        label="Quintile"
        value={filters.quintile}
        options={facets.quintiles}
        onChange={(v) => set("quintile", v)}
      />
      <FilterSelect
        label="Town / City"
        value={filters.town}
        options={facets.towns}
        onChange={(v) => set("town", v)}
        format={titleCase}
      />
    </div>
  );
};