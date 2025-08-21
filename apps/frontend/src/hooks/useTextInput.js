import { useState, useCallback, useMemo } from "react";

/**
 * Custom hook for enhanced text input functionality
 * Provides character counting, validation, and auto-resize capabilities
 *
 * @param {Object} options - Configuration options
 * @param {number} options.maxLength - Maximum character limit (default: 5000)
 * @param {number} options.warningThreshold - Percentage at which to show warning (default: 0.8)
 * @param {string} options.initialValue - Initial text value (default: '')
 * @returns {Object} Text input state and handlers
 */
export const useTextInput = ({
  maxLength = 5000,
  warningThreshold = 0.8,
  initialValue = "",
} = {}) => {
  const [text, setText] = useState(initialValue);

  // Calculate character count and validation states
  const characterCount = text.length;
  const warningLimit = Math.floor(maxLength * warningThreshold);
  const isAtWarning = characterCount >= warningLimit;
  const isAtLimit = characterCount >= maxLength;
  const isValid = characterCount > 0 && characterCount <= maxLength;

  // Calculate remaining characters
  const remainingCharacters = maxLength - characterCount;

  // Validation errors array
  const errors = useMemo(() => {
    const errorList = [];

    if (characterCount > maxLength) {
      errorList.push(`Text exceeds maximum length of ${maxLength} characters`);
    }

    return errorList;
  }, [characterCount, maxLength]);

  // Handle text change with character limit enforcement
  const handleTextChange = useCallback(
    (newText) => {
      // Enforce hard limit by truncating text
      if (newText.length > maxLength) {
        setText(newText.slice(0, maxLength));
      } else {
        setText(newText);
      }
    },
    [maxLength]
  );

  // Clear text
  const clearText = useCallback(() => {
    setText("");
  }, []);

  // Check if text is empty
  const isEmpty = text.trim().length === 0;

  // Get warning message
  const warningMessage = useMemo(() => {
    if (isAtLimit) {
      return `Character limit reached (${maxLength})`;
    }
    if (isAtWarning) {
      return `Approaching character limit (${remainingCharacters} remaining)`;
    }
    return null;
  }, [isAtLimit, isAtWarning, maxLength, remainingCharacters]);

  return {
    // Text state
    text,
    setText: handleTextChange,

    // Character counting
    characterCount,
    remainingCharacters,
    maxLength,

    // Validation states
    isValid,
    isEmpty,
    isAtWarning,
    isAtLimit,
    errors,
    warningMessage,

    // Actions
    clearText,
  };
};
