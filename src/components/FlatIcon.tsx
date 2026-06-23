interface FlatIconProps {
  name: string;
  className?: string;
}

export const FlatIcon = ({ name, className }: FlatIconProps) => (
  <span
    aria-hidden="true"
    className={className}
    style={{
      display: 'inline-block',
      backgroundColor: 'currentColor',
      maskImage: `url('/icons/flaticon/${name}.svg')`,
      WebkitMaskImage: `url('/icons/flaticon/${name}.svg')`,
      maskSize: 'contain',
      WebkitMaskSize: 'contain',
      maskRepeat: 'no-repeat',
      WebkitMaskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskPosition: 'center',
    }}
  />
);
