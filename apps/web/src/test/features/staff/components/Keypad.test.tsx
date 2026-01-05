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
        // Delete button has an icon, so we find by role or class. 
        // Or since we replaced it with ArrowLeft, we loop for a destructive button or just the 3rd column item.
        // Best to find by button role that doesn't have text we know, or just 'button' with destructive variant if possible.
        // Actually, in the Keypad implementation, it's the button after the numbers.
        // Just checking for the delete button wrapper or checking all buttons.

        // We can look for the button containing the lucide icon, but testing library usually relies on creating accessible queries.
        // Let's rely on the order or a test id if we added one. 
        // For now, let's assume it's the button with destructive variant (if we kept it) or just find by index.
        const buttons = screen.getAllByRole("button");
        // 11 number keys + 1 delete + 1 clear = 13 buttons.
        // Delete should be the 12th button (index 11) or finding by class.

        // Simpler: Keypad has "1"..."0" and "00".
        // Let's modify Keypad to have an aria-label for delete if needed, but for now let's try finding by failure to find text "Clear" or digits.

        // Wait, the delete button has `ArrowLeft`. We can find by icon? 
        // Testing-library doesn't see icons easily.
        // Let's just assume we can find it by `role="button"` and excludes others.

        // The delete button is the only one with `bg-red-500` class in my restoration?
        // Let's use `aria-label` in the component next time, but for now let's just inspect the DOM structure in the test... 
        // Actually, let's just update the test to be robust. 
        // But I cannot edit the component again just for this without user knowing.
        // I will find the button that is NOT a number and NOT clear.

        const deleteButton = buttons.find(b => !b.textContent?.match(/[0-9]|Clear/));
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
