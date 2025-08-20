import React from "react";
import { Button } from "./Button";

/**
 * Simple Error Display Component
 * 
 * A lightweight error display component for showing user-friendly error messages
 * with optional action buttons for recovery.
 */
export default function SimpleErrorDisplay({
    title = "Something went wrong",
    message = "An unexpected error occurred. Please try again.",
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    className = ""
}) {
    return (
        <div className={`text-center max-w-md mx-auto ${className}`}>
            {/* Error Icon */}
            <div className="mb-4">
                <div className="mx-auto w-16 h-16 bg-error-500/10 rounded-full flex items-center justify-center">
                    <svg
                        className="w-8 h-8 text-error-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                </div>
            </div>

            {/* Error Title */}
            <h3 className="text-[18px] font-semibold text-invert-high mb-2">
                {title}
            </h3>

            {/* Error Message */}
            <p className="text-[14px] text-invert-medium mb-6 leading-relaxed">
                {message}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {actionLabel && onAction && (
                    <Button
                        variant="solid"
                        onClick={onAction}
                        className="min-w-32"
                    >
                        {actionLabel}
                    </Button>
                )}

                {secondaryActionLabel && onSecondaryAction && (
                    <Button
                        variant="outline"
                        onClick={onSecondaryAction}
                        className="min-w-32"
                    >
                        {secondaryActionLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}