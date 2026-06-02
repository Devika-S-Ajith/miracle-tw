import moment from "moment";
import { utcToLocalWithoutSecond } from "./helperFunction";
import { getOrdinal } from "./helperFunction";

describe("utcToLocalWithoutSecond", () => {
    it("should convert UTC datetime string to local time in 'DD-MM-YYYY h:mm A' format", () => {
        // Use a fixed UTC datetime string
        const utcDateTime = "2024-06-01T12:34:56Z";
        const expected = moment.utc(utcDateTime).local().format("DD-MM-YYYY h:mm A");
        expect(utcToLocalWithoutSecond(utcDateTime)).toBe(expected);
    });

    it("should handle midnight correctly", () => {
        const utcDateTime = "2024-06-01T00:00:00Z";
        const expected = moment.utc(utcDateTime).local().format("DD-MM-YYYY h:mm A");
        expect(utcToLocalWithoutSecond(utcDateTime)).toBe(expected);
    });

    it("should handle noon correctly", () => {
        const utcDateTime = "2024-06-01T12:00:00Z";
        const expected = moment.utc(utcDateTime).local().format("DD-MM-YYYY h:mm A");
        expect(utcToLocalWithoutSecond(utcDateTime)).toBe(expected);
    });

    it("should return Invalid date for invalid input", () => {
        expect(utcToLocalWithoutSecond("invalid-date")).toBe("Invalid date");
    });

    describe("getOrdinal", () => {
        it("should return '1st' for 1", () => {
            expect(getOrdinal(1)).toBe("1st");
        });

        it("should return '2nd' for 2", () => {
            expect(getOrdinal(2)).toBe("2nd");
        });

        it("should return '3rd' for 3", () => {
            expect(getOrdinal(3)).toBe("3rd");
        });

        it("should return '4th' for 4", () => {
            expect(getOrdinal(4)).toBe("4th");
        });

        it("should return '11th' for 11", () => {
            expect(getOrdinal(11)).toBe("11th");
        });

        it("should return '12th' for 12", () => {
            expect(getOrdinal(12)).toBe("12th");
        });

        it("should return '13th' for 13", () => {
            expect(getOrdinal(13)).toBe("13th");
        });

        it("should return '21st' for 21", () => {
            expect(getOrdinal(21)).toBe("21st");
        });

        it("should return '22nd' for 22", () => {
            expect(getOrdinal(22)).toBe("22nd");
        });

        it("should return '23rd' for 23", () => {
            expect(getOrdinal(23)).toBe("23rd");
        });

        it("should return '101st' for 101", () => {
            expect(getOrdinal(101)).toBe("101st");
        });

        it("should return '111th' for 111", () => {
            expect(getOrdinal(111)).toBe("111th");
        });

        it("should throw error for 0", () => {
            expect(() => getOrdinal(0)).toThrow("Input must be a positive integer");
        });

        it("should throw error for negative numbers", () => {
            expect(() => getOrdinal(-5)).toThrow("Input must be a positive integer");
        });

        it("should throw error for non-integer numbers", () => {
            expect(() => getOrdinal(2.5)).toThrow("Input must be a positive integer");
        });

        it("should throw error for non-number input", () => {
            expect(() => getOrdinal("5")).toThrow("Input must be a positive integer");
            expect(() => getOrdinal(null)).toThrow("Input must be a positive integer");
            expect(() => getOrdinal(undefined)).toThrow("Input must be a positive integer");
            expect(() => getOrdinal({})).toThrow("Input must be a positive integer");
        });
    });
});