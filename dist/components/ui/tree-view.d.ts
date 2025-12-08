import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
interface TreeDataItem {
    id: string;
    name: string;
    icon?: React.ComponentType<{
        className?: string;
    }>;
    selectedIcon?: React.ComponentType<{
        className?: string;
    }>;
    openIcon?: React.ComponentType<{
        className?: string;
    }>;
    children?: TreeDataItem[];
    actions?: React.ReactNode;
    onClick?: () => void;
    draggable?: boolean;
    droppable?: boolean;
    disabled?: boolean;
    className?: string;
}
type TreeRenderItemParams = {
    item: TreeDataItem;
    level: number;
    isLeaf: boolean;
    isSelected: boolean;
    isOpen?: boolean;
    hasChildren: boolean;
};
declare const TreeView: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & {
    data: TreeDataItem[] | TreeDataItem;
    initialSelectedItemId?: string;
    onSelectChange?: (item: TreeDataItem | undefined) => void;
    expandAll?: boolean;
    defaultNodeIcon?: React.ComponentType<{
        className?: string;
    }>;
    defaultLeafIcon?: React.ComponentType<{
        className?: string;
    }>;
    onDocumentDrag?: (sourceItem: TreeDataItem, targetItem: TreeDataItem) => void;
    renderItem?: (params: TreeRenderItemParams) => React.ReactNode;
} & React.RefAttributes<HTMLDivElement>>;
declare const TreeItem: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & {
    data: TreeDataItem[] | TreeDataItem;
    initialSelectedItemId?: string;
    onSelectChange?: (item: TreeDataItem | undefined) => void;
    expandAll?: boolean;
    defaultNodeIcon?: React.ComponentType<{
        className?: string;
    }>;
    defaultLeafIcon?: React.ComponentType<{
        className?: string;
    }>;
    onDocumentDrag?: (sourceItem: TreeDataItem, targetItem: TreeDataItem) => void;
    renderItem?: (params: TreeRenderItemParams) => React.ReactNode;
} & {
    selectedItemId?: string;
    handleSelectChange: (item: TreeDataItem | undefined) => void;
    expandedItemIds: string[];
    defaultNodeIcon?: React.ComponentType<{
        className?: string;
    }>;
    defaultLeafIcon?: React.ComponentType<{
        className?: string;
    }>;
    handleDragStart?: (item: TreeDataItem) => void;
    handleDrop?: (item: TreeDataItem) => void;
    draggedItem: TreeDataItem | null;
    level?: number;
} & React.RefAttributes<HTMLDivElement>>;
declare const TreeNode: ({ item, handleSelectChange, expandedItemIds, selectedItemId, defaultNodeIcon, defaultLeafIcon, handleDragStart, handleDrop, draggedItem, renderItem, level, }: {
    item: TreeDataItem;
    handleSelectChange: (item: TreeDataItem | undefined) => void;
    expandedItemIds: string[];
    selectedItemId?: string;
    defaultNodeIcon?: React.ComponentType<{
        className?: string;
    }>;
    defaultLeafIcon?: React.ComponentType<{
        className?: string;
    }>;
    handleDragStart?: (item: TreeDataItem) => void;
    handleDrop?: (item: TreeDataItem) => void;
    draggedItem: TreeDataItem | null;
    renderItem?: (params: TreeRenderItemParams) => React.ReactNode;
    level?: number;
}) => import("react/jsx-runtime").JSX.Element;
declare const TreeLeaf: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & {
    item: TreeDataItem;
    level: number;
    selectedItemId?: string;
    handleSelectChange: (item: TreeDataItem | undefined) => void;
    defaultLeafIcon?: React.ComponentType<{
        className?: string;
    }>;
    handleDragStart?: (item: TreeDataItem) => void;
    handleDrop?: (item: TreeDataItem) => void;
    draggedItem: TreeDataItem | null;
    renderItem?: (params: TreeRenderItemParams) => React.ReactNode;
} & React.RefAttributes<HTMLDivElement>>;
declare const AccordionTrigger: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
} & React.RefAttributes<HTMLDivElement>>;
declare const AccordionContent: React.ForwardRefExoticComponent<Omit<AccordionPrimitive.AccordionContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { TreeView, type TreeDataItem, type TreeRenderItemParams, AccordionTrigger, AccordionContent, TreeLeaf, TreeNode, TreeItem };
//# sourceMappingURL=tree-view.d.ts.map