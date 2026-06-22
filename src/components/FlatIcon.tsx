/* eslint-disable @next/next/no-img-element */

interface FlatIconProps {
  name: string;
  className?: string;
}

export const FlatIcon = ({ name, className }: FlatIconProps) => (
  <img src={`/icons/flaticon/${name}.svg`} alt="" aria-hidden="true" className={className} />
);
