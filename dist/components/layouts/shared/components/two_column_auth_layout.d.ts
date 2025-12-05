import type { StaticImageData } from "next/image";
type TwoColumnAuthLayoutProps = {
    imageSrc: string | StaticImageData;
    imageAlt: string;
    imageBackgroundColor?: string;
    formContent: React.ReactNode;
    className?: string;
    visualPanelClassName?: string;
    formContainerClassName?: string;
};
export declare function TwoColumnAuthLayout({ imageSrc, imageAlt, imageBackgroundColor, formContent, className, visualPanelClassName, formContainerClassName, }: TwoColumnAuthLayoutProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=two_column_auth_layout.d.ts.map