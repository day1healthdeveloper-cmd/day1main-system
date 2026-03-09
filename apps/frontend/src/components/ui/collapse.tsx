import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";

interface CollapseProps {
  size?: "small" | "large";
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
  onEdit?: () => void;
  showEdit?: boolean;
}

interface CollapseGroupProps {
  multiple?: boolean;
  children: React.ReactNode;
}

const ArrowIcon = () => (
  <svg
    height="16"
    strokeLinejoin="round"
    viewBox="0 0 16 16"
    width="16"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.0607 5.49999L13.5303 6.03032L8.7071 10.8535C8.31658 11.2441 7.68341 11.2441 7.29289 10.8535L2.46966 6.03032L1.93933 5.49999L2.99999 4.43933L3.53032 4.96966L7.99999 9.43933L12.4697 4.96966L13 4.43933L14.0607 5.49999Z"
    />
  </svg>
);

const Collapse = ({ 
  size = "large", 
  title, 
  children, 
  defaultExpanded, 
  isOpen, 
  onToggle, 
  className,
  onEdit,
  showEdit = false
}: CollapseProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [_isOpen, set_isOpen] = useState<boolean>(defaultExpanded || false);
  const [maxHeight, setMaxHeight] = useState<number>(0);

  useEffect(() => {
    if (isOpen !== undefined) {
      set_isOpen(isOpen);
    }
  }, [isOpen]);

  useEffect(() => {
    if (_isOpen && contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight);
    }
  }, [_isOpen, children]);

  return (
    <div className={clsx("text-left border-y border-gray-200 overflow-hidden font-sans", className)}>
      <h3 className={clsx("text-gray-900", size === "small" ? "text-base font-medium" : "text-base font-semibold")}>
        <div className="flex items-center justify-between">
          <button
            onClick={onToggle && isOpen !== undefined ? onToggle : () => set_isOpen(!_isOpen)}
            className="cursor-pointer flex-1 transition px-4"
          >
            <span className={clsx("flex justify-between items-center w-full", size === "small" ? "py-3" : "py-3")}>
              {title}
              <span className={clsx("fill-gray-900 flex duration-200", _isOpen && "rotate-180")}>
                <ArrowIcon />
              </span>
            </span>
          </button>
          {showEdit && onEdit && _isOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="px-4 py-3 text-blue-600 hover:text-blue-700 transition"
              title="Edit section"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.333 2.00004C11.5081 1.82494 11.716 1.68605 11.9447 1.59129C12.1735 1.49653 12.4187 1.44775 12.6663 1.44775C12.914 1.44775 13.1592 1.49653 13.3879 1.59129C13.6167 1.68605 13.8246 1.82494 13.9997 2.00004C14.1748 2.17513 14.3137 2.383 14.4084 2.61178C14.5032 2.84055 14.552 3.08575 14.552 3.33337C14.552 3.58099 14.5032 3.82619 14.4084 4.05497C14.3137 4.28374 14.1748 4.49161 13.9997 4.66671L5.33301 13.3334L1.99967 14.3334L2.99967 11L11.333 2.00004Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </h3>
      <div
        ref={contentRef}
        className="transition-all ease-in-out duration-200 overflow-hidden"
        style={{ maxHeight: _isOpen ? `${maxHeight}px` : 0 }}
      >
        <div className="px-4 pb-4">{children}</div>
      </div>
    </div>
  );
};

const CollapseGroup = ({ multiple = false, children }: CollapseGroupProps) => {
  const collapses = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<CollapseProps> =>
      React.isValidElement(child) && "props" in child
  );

  const [openStates, setOpenStates] = useState(() =>
    collapses.map((child) => child.props.defaultExpanded || false)
  );

  const handleToggle = (index: number) => {
    setOpenStates((prev) =>
      multiple
        ? prev.map((state, i) => (i === index ? !state : state))
        : prev.map((state, i) => (i === index ? !state : false))
    );
  };

  return (
    <div className="border-t border-gray-200">
      {collapses.map((child, index) =>
        React.cloneElement(child, {
          isOpen: openStates[index],
          onToggle: () => handleToggle(index),
          className: "border-t-0",
        })
      )}
    </div>
  );
};

export { CollapseGroup, Collapse };
