'use client';
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronRight } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
const treeVariants = cva('group hover:before:opacity-100 before:absolute before:rounded-lg before:left-0 px-2 before:w-full before:opacity-0 before:bg-accent/70 before:h-[2rem] before:-z-10');
const selectedTreeVariants = cva('before:opacity-100 before:bg-accent/70 text-accent-foreground');
const dragOverVariants = cva('before:opacity-100 before:bg-primary/20 text-primary-foreground');
const TreeView = React.forwardRef((_a, ref) => {
    var { data, initialSelectedItemId, onSelectChange, expandAll, defaultLeafIcon, defaultNodeIcon, className, onDocumentDrag, renderItem } = _a, props = __rest(_a, ["data", "initialSelectedItemId", "onSelectChange", "expandAll", "defaultLeafIcon", "defaultNodeIcon", "className", "onDocumentDrag", "renderItem"]);
    const [selectedItemId, setSelectedItemId] = React.useState(initialSelectedItemId);
    const [draggedItem, setDraggedItem] = React.useState(null);
    const handleSelectChange = React.useCallback((item) => {
        setSelectedItemId(item === null || item === void 0 ? void 0 : item.id);
        if (onSelectChange) {
            onSelectChange(item);
        }
    }, [onSelectChange]);
    const handleDragStart = React.useCallback((item) => {
        setDraggedItem(item);
    }, []);
    const handleDrop = React.useCallback((targetItem) => {
        if (draggedItem && onDocumentDrag && draggedItem.id !== targetItem.id) {
            onDocumentDrag(draggedItem, targetItem);
        }
        setDraggedItem(null);
    }, [draggedItem, onDocumentDrag]);
    const expandedItemIds = React.useMemo(() => {
        if (!initialSelectedItemId) {
            return [];
        }
        const ids = [];
        function walkTreeItems(items, targetId) {
            if (Array.isArray(items)) {
                for (let i = 0; i < items.length; i++) {
                    ids.push(items[i].id);
                    if (walkTreeItems(items[i], targetId) && !expandAll) {
                        return true;
                    }
                    if (!expandAll)
                        ids.pop();
                }
            }
            else if (!expandAll && items.id === targetId) {
                return true;
            }
            else if (items.children) {
                return walkTreeItems(items.children, targetId);
            }
        }
        walkTreeItems(data, initialSelectedItemId);
        return ids;
    }, [data, expandAll, initialSelectedItemId]);
    return (_jsxs("div", { className: cn('overflow-hidden relative p-2', className), children: [_jsx(TreeItem, Object.assign({ data: data, ref: ref, selectedItemId: selectedItemId, handleSelectChange: handleSelectChange, expandedItemIds: expandedItemIds, defaultLeafIcon: defaultLeafIcon, defaultNodeIcon: defaultNodeIcon, handleDragStart: handleDragStart, handleDrop: handleDrop, draggedItem: draggedItem, renderItem: renderItem, level: 0 }, props)), _jsx("div", { className: 'w-full h-[48px]', onDrop: () => { handleDrop({ id: '', name: 'parent_div' }); } })] }));
});
TreeView.displayName = 'TreeView';
const TreeItem = React.forwardRef((_a, ref) => {
    var { className, data, selectedItemId, handleSelectChange, expandedItemIds, defaultNodeIcon, defaultLeafIcon, handleDragStart, handleDrop, draggedItem, renderItem, level, onSelectChange, expandAll, initialSelectedItemId, onDocumentDrag } = _a, props = __rest(_a, ["className", "data", "selectedItemId", "handleSelectChange", "expandedItemIds", "defaultNodeIcon", "defaultLeafIcon", "handleDragStart", "handleDrop", "draggedItem", "renderItem", "level", "onSelectChange", "expandAll", "initialSelectedItemId", "onDocumentDrag"]);
    if (!(Array.isArray(data))) {
        data = [data];
    }
    return (_jsx("div", Object.assign({ ref: ref, role: "tree", className: className }, props, { children: _jsx("ul", { children: data.map((item) => (_jsx("li", { children: item.children ? (_jsx(TreeNode, { item: item, level: level !== null && level !== void 0 ? level : 0, selectedItemId: selectedItemId, expandedItemIds: expandedItemIds, handleSelectChange: handleSelectChange, defaultNodeIcon: defaultNodeIcon, defaultLeafIcon: defaultLeafIcon, handleDragStart: handleDragStart, handleDrop: handleDrop, draggedItem: draggedItem, renderItem: renderItem })) : (_jsx(TreeLeaf, { item: item, level: level !== null && level !== void 0 ? level : 0, selectedItemId: selectedItemId, handleSelectChange: handleSelectChange, defaultLeafIcon: defaultLeafIcon, handleDragStart: handleDragStart, handleDrop: handleDrop, draggedItem: draggedItem, renderItem: renderItem })) }, item.id))) }) })));
});
TreeItem.displayName = 'TreeItem';
const TreeNode = ({ item, handleSelectChange, expandedItemIds, selectedItemId, defaultNodeIcon, defaultLeafIcon, handleDragStart, handleDrop, draggedItem, renderItem, level = 0, }) => {
    var _a;
    const [value, setValue] = React.useState(expandedItemIds.includes(item.id) ? [item.id] : []);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const hasChildren = !!((_a = item.children) === null || _a === void 0 ? void 0 : _a.length);
    const isSelected = selectedItemId === item.id;
    const isOpen = value.includes(item.id);
    const onDragStart = (e) => {
        if (!item.draggable) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('text/plain', item.id);
        handleDragStart === null || handleDragStart === void 0 ? void 0 : handleDragStart(item);
    };
    const onDragOver = (e) => {
        if (item.droppable !== false && draggedItem && draggedItem.id !== item.id) {
            e.preventDefault();
            setIsDragOver(true);
        }
    };
    const onDragLeave = () => {
        setIsDragOver(false);
    };
    const onDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleDrop === null || handleDrop === void 0 ? void 0 : handleDrop(item);
    };
    return (_jsx(AccordionPrimitive.Root, { type: "multiple", value: value, onValueChange: (s) => setValue(s), children: _jsxs(AccordionPrimitive.Item, { value: item.id, children: [_jsx(AccordionTrigger, { className: cn(treeVariants(), isSelected && selectedTreeVariants(), isDragOver && dragOverVariants(), item.className), onClick: () => {
                        var _a;
                        handleSelectChange(item);
                        (_a = item.onClick) === null || _a === void 0 ? void 0 : _a.call(item);
                    }, draggable: !!item.draggable, onDragStart: onDragStart, onDragOver: onDragOver, onDragLeave: onDragLeave, onDrop: onDrop, children: renderItem ? (renderItem({
                        item,
                        level,
                        isLeaf: false,
                        isSelected,
                        isOpen,
                        hasChildren,
                    })) : (_jsxs(_Fragment, { children: [_jsx(TreeIcon, { item: item, isSelected: isSelected, isOpen: isOpen, default: defaultNodeIcon }), _jsx("span", { className: "text-sm truncate", children: item.name }), _jsx(TreeActions, { isSelected: isSelected, children: item.actions })] })) }), _jsx(AccordionContent, { className: "ml-4 pl-1 border-l", children: _jsx(TreeItem, { data: item.children ? item.children : item, selectedItemId: selectedItemId, handleSelectChange: handleSelectChange, expandedItemIds: expandedItemIds, defaultLeafIcon: defaultLeafIcon, defaultNodeIcon: defaultNodeIcon, handleDragStart: handleDragStart, handleDrop: handleDrop, draggedItem: draggedItem, renderItem: renderItem, level: level + 1 }) })] }) }));
};
const TreeLeaf = React.forwardRef((_a, ref) => {
    var { className, item, level, selectedItemId, handleSelectChange, defaultLeafIcon, handleDragStart, handleDrop, draggedItem, renderItem } = _a, props = __rest(_a, ["className", "item", "level", "selectedItemId", "handleSelectChange", "defaultLeafIcon", "handleDragStart", "handleDrop", "draggedItem", "renderItem"]);
    const [isDragOver, setIsDragOver] = React.useState(false);
    const isSelected = selectedItemId === item.id;
    const onDragStart = (e) => {
        if (!item.draggable || item.disabled) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('text/plain', item.id);
        handleDragStart === null || handleDragStart === void 0 ? void 0 : handleDragStart(item);
    };
    const onDragOver = (e) => {
        if (item.droppable !== false && !item.disabled && draggedItem && draggedItem.id !== item.id) {
            e.preventDefault();
            setIsDragOver(true);
        }
    };
    const onDragLeave = () => {
        setIsDragOver(false);
    };
    const onDrop = (e) => {
        if (item.disabled)
            return;
        e.preventDefault();
        setIsDragOver(false);
        handleDrop === null || handleDrop === void 0 ? void 0 : handleDrop(item);
    };
    return (_jsx("div", Object.assign({ ref: ref, className: cn('ml-5 flex text-left items-center py-2 cursor-pointer before:right-1', treeVariants(), className, isSelected && selectedTreeVariants(), isDragOver && dragOverVariants(), item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none', item.className), onClick: () => {
            var _a;
            if (item.disabled)
                return;
            handleSelectChange(item);
            (_a = item.onClick) === null || _a === void 0 ? void 0 : _a.call(item);
        }, draggable: !!item.draggable && !item.disabled, onDragStart: onDragStart, onDragOver: onDragOver, onDragLeave: onDragLeave, onDrop: onDrop }, props, { children: renderItem ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "h-4 w-4 shrink-0 mr-1" }), renderItem({
                    item,
                    level,
                    isLeaf: true,
                    isSelected,
                    hasChildren: false,
                })] })) : (_jsxs(_Fragment, { children: [_jsx(TreeIcon, { item: item, isSelected: isSelected, default: defaultLeafIcon }), _jsx("span", { className: "flex-grow text-sm truncate", children: item.name }), _jsx(TreeActions, { isSelected: isSelected && !item.disabled, children: item.actions })] })) })));
});
TreeLeaf.displayName = 'TreeLeaf';
const AccordionTrigger = React.forwardRef((_a, ref) => {
    var { className, children, onClick } = _a, props = __rest(_a, ["className", "children", "onClick"]);
    return (_jsx(AccordionPrimitive.Header, { className: "flex", children: _jsx(AccordionPrimitive.Trigger, { asChild: true, children: _jsxs("div", Object.assign({ ref: ref, role: "button", tabIndex: 0, className: cn('flex flex-1 w-full items-center py-2 transition-all cursor-pointer first:[&[data-state=open]>svg]:first-of-type:rotate-90', className), onClick: onClick, onKeyDown: (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onClick === null || onClick === void 0 ? void 0 : onClick(e);
                    }
                } }, props, { children: [_jsx(ChevronRight, { className: "h-4 w-4 shrink-0 transition-transform duration-200 text-accent-foreground/50 mr-1" }), children] })) }) }));
});
AccordionTrigger.displayName = 'AccordionTrigger';
const AccordionContent = React.forwardRef((_a, ref) => {
    var { className, children } = _a, props = __rest(_a, ["className", "children"]);
    return (_jsx(AccordionPrimitive.Content, Object.assign({ ref: ref, className: cn('overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down', className) }, props, { children: _jsx("div", { className: "pb-1 pt-0", children: children }) })));
});
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
const TreeIcon = ({ item, isOpen, isSelected, default: defaultIcon }) => {
    let Icon = defaultIcon;
    if (isSelected && item.selectedIcon) {
        Icon = item.selectedIcon;
    }
    else if (isOpen && item.openIcon) {
        Icon = item.openIcon;
    }
    else if (item.icon) {
        Icon = item.icon;
    }
    return Icon ? (_jsx(Icon, { className: "h-4 w-4 shrink-0 mr-2" })) : (_jsx(_Fragment, {}));
};
const TreeActions = ({ children, isSelected }) => {
    return (_jsx("div", { className: cn(isSelected ? 'block' : 'hidden', 'absolute right-3 group-hover:block'), children: children }));
};
export { TreeView, AccordionTrigger, AccordionContent, TreeLeaf, TreeNode, TreeItem };
