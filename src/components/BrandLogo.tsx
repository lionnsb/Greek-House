import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/mati-tis-thalassas-logo.png"
      alt="Mati tis Thalassas"
      width={329}
      height={364}
      className={className}
      priority={priority}
    />
  );
}
