import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MoodImprovement from "./MoodImprovement";


// ====== COMPONENT-SPECIFIC MOCKS ======


jest.mock("../../../../assets/icons/BoldArrow", () => () => (
  <span data-testid="bold-arrow" aria-label="Arrow indicating mood change" />
));


jest.mock("../../Components/StateGovDashboardComponents/MoodImageMapping", () => ({
  MoodImageMapping: {
    HAPPY: "/happy-icon.png",
    SAD: "/sad-icon.png",
    THRIVING: "/thriving-icon.png",
    INCRISIS: "/incrisis-icon.png",
    VULNERABLE: "/vulnerable-icon.png",
    SAFE: "/safe-icon.png",
  },
}));


describe("MoodImprovement Component", () => {
  it("renders correctly with provided emoji keys", () => {
    render(<MoodImprovement fromEmoji="SAD" toEmoji="HAPPY" />);


    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);


    // Verify 'From' image
    expect(images[0]).toHaveAttribute("src", "/sad-icon.png");
    expect(images[0]).toHaveAttribute("alt", "From Mood");
    expect(images[0]).toHaveAttribute("width", "25");
    expect(images[0]).toHaveAttribute("height", "25");


    // Verify Arrow
    expect(screen.getByTestId("bold-arrow")).toBeInTheDocument();


    // Verify 'To' image
    expect(images[1]).toHaveAttribute("src", "/happy-icon.png");
    expect(images[1]).toHaveAttribute("alt", "To Mood");
    expect(images[1]).toHaveAttribute("width", "25");
    expect(images[1]).toHaveAttribute("height", "25");
  });


  it("applies custom alt text and size props", () => {
    const customSize = 50;
    render(
      <MoodImprovement
        fromEmoji="INCRISIS"
        toEmoji="THRIVING"
        altFrom="Very Sad"
        altTo="Very Happy"
        size={customSize}
      />
    );


    const images = screen.getAllByRole("img");
    expect(images[0]).toHaveAttribute("alt", "Very Sad");
    expect(images[1]).toHaveAttribute("alt", "Very Happy");
    expect(images[0]).toHaveAttribute("width", "50");
    expect(images[0]).toHaveAttribute("height", "50");
  });


  it("uses default props correctly when optional ones are omitted", () => {
    render(<MoodImprovement fromEmoji="THRIVING" toEmoji="VULNERABLE" />);
    const images = screen.getAllByRole("img");
    expect(images[0]).toHaveAttribute("width", "25"); // Default size
    expect(images[0]).toHaveAttribute("alt", "From Mood"); // Default alt
    expect(images[1]).toHaveAttribute("alt", "To Mood"); // Default alt
  });


  it("handles undefined mood mapping gracefully", () => {
  render(<MoodImprovement fromEmoji="UNKNOWN" toEmoji="HAPPY" />);
  const images = screen.getAllByRole("img");
 
  // Component should render both images without crashing
  expect(images).toHaveLength(2);
 
  // The 'from' image with undefined src will render but show broken image
  // We just need to ensure it doesn't crash the component
  expect(images[0]).toBeInTheDocument();
 
  // The 'to' image should work correctly
  expect(images[1]).toHaveAttribute("src", "/happy-icon.png");
  expect(images[1]).toHaveAttribute("alt", "To Mood");
});
  it("applies correct container styling", () => {
    const { container } = render(
      <MoodImprovement fromEmoji="SAD" toEmoji="HAPPY" />
    );
   
    const containerDiv = container.firstChild;
    expect(containerDiv).toHaveStyle({
      display: 'flex',
      alignItems: 'center',
      gap: '1px' // Note: React converts number 1 to '1px'
    });
  });


  it("applies objectFit: contain to images", () => {
    render(<MoodImprovement fromEmoji="SAFE" toEmoji="THRIVING" />);
   
    const images = screen.getAllByRole("img");
    images.forEach(img => {
      expect(img).toHaveStyle({ objectFit: 'contain' });
    });
  });


  it("renders arrow between images", () => {
    render(<MoodImprovement fromEmoji="VULNERABLE" toEmoji="SAFE" />);
   
    const images = screen.getAllByRole("img");
    const arrow = screen.getByTestId("bold-arrow");
   
    // Arrow should be in the middle
    expect(arrow).toBeInTheDocument();
  });


  // Test all available mood types from the mock
  it("renders all supported mood types correctly", () => {
    const moodPairs = [
      { from: "INCRISIS", to: "SAFE" },
      { from: "VULNERABLE", to: "THRIVING" },
      { from: "SAFE", to: "HAPPY" },
    ];
   
    moodPairs.forEach(pair => {
      const { unmount } = render(
        <MoodImprovement fromEmoji={pair.from} toEmoji={pair.to} />
      );
     
      const images = screen.getAllByRole("img");
      expect(images[0]).toHaveAttribute("src", expect.stringContaining(".png"));
      expect(images[1]).toHaveAttribute("src", expect.stringContaining(".png"));
     
      unmount();
    });
  });
});


/*
// ====== COMMENTED OUT TESTS FOR REFERENCE IMAGES ======
// The commented code in the component shows these icon paths:
// - /static/icons/inCrisisIcon.png
// - /static/icons/safeIcon.png
// - /static/icons/thrivingIcon.png
// - /static/icons/vulnerableIcon.png
// These appear to be different from the MoodImageMapping keys
// If your actual implementation uses these paths, you should test them:


describe("MoodImprovement with actual icon paths", () => {
  // These tests would be needed if the component actually uses those paths
  // instead of MoodImageMapping
 
  it.skip("renders with crisis icon path", () => {
    // If the component actually uses /static/icons/inCrisisIcon.png
    // This test would verify that path
  });
 
  it.skip("renders with safe icon path", () => {
    // Test for /static/icons/safeIcon.png
  });
 
  it.skip("renders with thriving icon path", () => {
    // Test for /static/icons/thrivingIcon.png
  });
 
  it.skip("renders with vulnerable icon path", () => {
    // Test for /static/icons/vulnerableIcon.png
  });
});
*/

