import { useId } from 'react';
import Icon from './Icon';
import { LOCATIONS } from '../../data/categories';

/**
 * Service-location picker.
 *
 * Built on a native <select> so it inherits platform keyboard handling, mobile
 * pickers and screen-reader semantics for free — a custom listbox would add
 * bugs here for no visual gain.
 */
export default function LocationSelect({
  value,
  onChange,
  label = 'Service location',
  variant = 'pill',
  hideLabel = true,
  id: idProp,
}) {
  const autoId = useId();
  const id = idProp ?? `loc-${autoId}`;

  return (
    <div className={`loc-select loc-${variant}`}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'field-label'}>
        {label}
      </label>
      <span className="loc-pin" aria-hidden="true">
        <Icon name="pin" size={17} />
      </span>
      <select id={id} className="loc-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {LOCATIONS.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      <span className="loc-chevron" aria-hidden="true">
        <Icon name="chevronDown" size={16} />
      </span>
    </div>
  );
}
