import React from "react";
import { render, screen } from "@testing-library/react";
import OptionsHelperText from "./OptionsHelperText";

jest.mock("../../../components/LabelValue/LabelValue", () => ({ label, value }) => (
    <div data-testid="label-value">
        <span>{label}</span>
        <span>{value}</span>
    </div>
));

describe("OptionsHelperText", () => {
    it("renders two LabelValue components with correct labels and values", () => {
        render(<OptionsHelperText options={[]} />);
        const labelValueElements = screen.getAllByTestId("label-value");
        expect(labelValueElements).toHaveLength(2);

        expect(labelValueElements[0]).toHaveTextContent("In-crisis");
        expect(labelValueElements[1]).toHaveTextContent("Vulnerable");

        // Check that the value text appears in both
        const valueText =
            "The gentle hum of the city faded as the sun dipped below the horizon, casting long shadows across the quiet streets. In the distance, the faint aroma of fresh bread drifted from a nearby bakery, mingling with the crisp evening air. People hurried home, their footsteps echoing softly on the pavement, while streetlights flickered to life, illuminating the path ahead. It was a moment of calm, a brief pause before the world awakened once more to the rhythm of a new day.";
        expect(labelValueElements[0]).toHaveTextContent(valueText);
        expect(labelValueElements[1]).toHaveTextContent(valueText);
    });
});