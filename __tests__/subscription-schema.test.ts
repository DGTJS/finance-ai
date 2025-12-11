import { describe, it, expect } from "vitest";
import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  deleteSubscriptionSchema,
} from "../app/_actions/subscription/schema";

describe("Subscription Schemas", () => {
  describe("createSubscriptionSchema", () => {
    it("deve validar dados corretos", () => {
      const validData = {
        name: "Netflix",
        amount: 39.9,
        dueDate: new Date("2025-02-01"),
        recurring: true,
        active: true,
      };

      const result = createSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar nome vazio", () => {
      const invalidData = {
        name: "",
        amount: 39.9,
        dueDate: new Date(),
      };

      const result = createSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("deve rejeitar valor negativo", () => {
      const invalidData = {
        name: "Netflix",
        amount: -10,
        dueDate: new Date(),
      };

      const result = createSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("deve aceitar valores decimais", () => {
      const validData = {
        name: "Spotify",
        amount: 19.99,
        dueDate: new Date(),
      };

      const result = createSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("deve aplicar defaults corretos", () => {
      const data = {
        name: "Disney+",
        amount: 43.9,
        dueDate: new Date(),
      };

      const result = createSubscriptionSchema.parse(data);
      expect(result.recurring).toBe(true);
      expect(result.active).toBe(true);
    });
  });

  describe("updateSubscriptionSchema", () => {
    it("deve validar dados de atualização corretos", () => {
      const validData = {
        id: "sub-123",
        name: "Netflix Premium",
        amount: 55.9,
      };

      const result = updateSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar sem ID", () => {
      const invalidData = {
        name: "Netflix",
      };

      const result = updateSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("deve aceitar atualização parcial", () => {
      const validData = {
        id: "sub-123",
        active: false,
      };

      const result = updateSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("deleteSubscriptionSchema", () => {
    it("deve validar ID correto", () => {
      const validData = {
        id: "sub-123",
      };

      const result = deleteSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("deve rejeitar ID vazio", () => {
      const invalidData = {
        id: "",
      };

      const result = deleteSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

