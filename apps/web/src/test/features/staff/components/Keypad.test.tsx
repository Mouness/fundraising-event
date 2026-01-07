import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Keypad } from "@features/staff/components/Keypad";

describe("Keypad", () => {
    const defaultProps = {
        onKeyPress: vi.fn(),
        onDelete: vi.fn(),
        onClear: vi.fn(),
    };

    it("renders all number keys", () => {
        render(<Keypad {...defaultProps} />);
        const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "00"];
        keys.forEach((key) => {
            expect(screen.getByText(key)).toBeInTheDocument();
        });
    });

    it("calls onKeyPress when a number is clicked", () => {
        render(<Keypad {...defaultProps} />);
        fireEvent.click(screen.getByText("5"));
        expect(defaultProps.onKeyPress).toHaveBeenCalledWith("5");
    });

    it("calls onDelete when delete button is clicked", () => {
        render(<Keypad {...defaultProps} />);

        // Find the button that is the delete button (usually the 11th button in sequence or by icon/variant)
        // Since we can't reliably query by icon without aria-label, and order is fixed:
        // 1, 2, 3, 4, 5, 6, 7, 8, 9, 00, 0, Del, Clear
        // But 00 and 0 are buttons too.
        // Let's get all buttons and filter out known text ones.

        const buttons = screen.getAllByRole("button");
        const deleteButton = buttons.find(b => {
            const text = b.textContent?.trim();
            return !text?.match(/^\d+$/) && text !== 'Clear' && text !== '.';
        });

        expect(deleteButton).toBeTruthy();
        if (deleteButton) {
            fireEvent.click(deleteButton);
            expect(defaultProps.onDelete).toHaveBeenCalled();
        }
    });

    it("calls onClear when Clear button is clicked", () => {
        render(<Keypad {...defaultProps} />);
        fireEvent.click(screen.getByText(/clear/i));
        expect(defaultProps.onClear).toHaveBeenCalled();
    });

    it("disables all buttons when disabled prop is true", () => {
        render(<Keypad {...defaultProps} disabled={true} />);
        const buttons = screen.getAllByRole("button");
        buttons.forEach((button) => {
            expect(button).toBeDisabled();
        });
    });
});
