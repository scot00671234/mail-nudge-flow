import { EmailFooterService } from '../email-footer-service';

// Mock storage
const mockStorage = {
  getUser: jest.fn(),
  updateUser: jest.fn(),
};

// Mock the storage import
jest.mock('../storage', () => ({
  storage: mockStorage,
}));

describe('EmailFooterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('shouldIncludeFooter', () => {
    it('should include footer for free users', async () => {
      mockStorage.getUser.mockResolvedValue({
        id: 1,
        subscriptionPlan: 'free',
        hideEmailFooter: false,
      });

      const result = await EmailFooterService.shouldIncludeFooter(1);
      expect(result).toBe(true);
    });

    it('should include footer for free users even if hideEmailFooter is true', async () => {
      mockStorage.getUser.mockResolvedValue({
        id: 1,
        subscriptionPlan: 'free',
        hideEmailFooter: true,
      });

      const result = await EmailFooterService.shouldIncludeFooter(1);
      expect(result).toBe(true);
    });

    it('should not include footer for pro users with hideEmailFooter true', async () => {
      mockStorage.getUser.mockResolvedValue({
        id: 1,
        subscriptionPlan: 'pro',
        hideEmailFooter: true,
      });

      const result = await EmailFooterService.shouldIncludeFooter(1);
      expect(result).toBe(false);
    });

    it('should include footer for pro users with hideEmailFooter false', async () => {
      mockStorage.getUser.mockResolvedValue({
        id: 1,
        subscriptionPlan: 'pro',
        hideEmailFooter: false,
      });

      const result = await EmailFooterService.shouldIncludeFooter(1);
      expect(result).toBe(true);
    });

    it('should include footer for unknown users', async () => {
      mockStorage.getUser.mockResolvedValue(null);

      const result = await EmailFooterService.shouldIncludeFooter(999);
      expect(result).toBe(true);
    });
  });

  describe('canToggleFooter', () => {
    it('should allow toggling for pro users', async () => {
      mockStorage.getUser.mockResolvedValue({
        id: 1,
        subscriptionPlan: 'pro',
      });

      const result = await EmailFooterService.canToggleFooter(1);
      expect(result).toBe(true);
    });

    it('should allow toggling for enterprise users', async () => {
      mockStorage.getUser.mockResolvedValue({
        id: 1,
        subscriptionPlan: 'enterprise',
      });

      const result = await EmailFooterService.canToggleFooter(1);
      expect(result).toBe(true);
    });

    it('should not allow toggling for free users', async () => {
      mockStorage.getUser.mockResolvedValue({
        id: 1,
        subscriptionPlan: 'free',
      });

      const result = await EmailFooterService.canToggleFooter(1);
      expect(result).toBe(false);
    });

    it('should not allow toggling for unknown users', async () => {
      mockStorage.getUser.mockResolvedValue(null);

      const result = await EmailFooterService.canToggleFooter(999);
      expect(result).toBe(false);
    });
  });

  describe('addFooterToHtml', () => {
    it('should add footer to HTML with body tag', async () => {
      mockStorage.getUser.mockResolvedValue({
        id: 1,
        subscriptionPlan: 'free',
        hideEmailFooter: false,
      });

      const originalHtml = '<html><body><h1>Test Email</h1></body></html>';
      const result = await EmailFooterService.addFooterToHtml(originalHtml, 1);
      
      expect(result).toContain('Powered by');
      expect(result).toContain('invoicenudgerflow.com');
      expect(result).toContain('<h1>Test Email</h1>');
    });

    it('should add footer to HTML without body tag', async () => {
      mockStorage.getUser.mockResolvedValue({
        id: 1,
        subscriptionPlan: 'free',
        hideEmailFooter: false,
      });

      const originalHtml = '<h1>Test Email</h1>';
      const result = await EmailFooterService.addFooterToHtml(originalHtml, 1);
      
      expect(result).toContain('Powered by');
      expect(result).toContain('invoicenudgerflow.com');
      expect(result).toContain('<h1>Test Email</h1>');
    });

    it('should not add footer for pro users with hideEmailFooter true', async () => {
      mockStorage.getUser.mockResolvedValue({
        id: 1,
        subscriptionPlan: 'pro',
        hideEmailFooter: true,
      });

      const originalHtml = '<html><body><h1>Test Email</h1></body></html>';
      const result = await EmailFooterService.addFooterToHtml(originalHtml, 1);
      
      expect(result).toBe(originalHtml);
      expect(result).not.toContain('Powered by');
    });
  });

  describe('updateFooterPreference', () => {
    it('should update preference for pro users', async () => {
      mockStorage.getUser.mockResolvedValue({
        id: 1,
        subscriptionPlan: 'pro',
      });
      mockStorage.updateUser.mockResolvedValue({
        id: 1,
        subscriptionPlan: 'pro',
        hideEmailFooter: true,
      });

      const result = await EmailFooterService.updateFooterPreference(1, true);
      
      expect(result.success).toBe(true);
      expect(mockStorage.updateUser).toHaveBeenCalledWith(1, { hideEmailFooter: true });
    });

    it('should reject update for free users', async () => {
      mockStorage.getUser.mockResolvedValue({
        id: 1,
        subscriptionPlan: 'free',
      });

      const result = await EmailFooterService.updateFooterPreference(1, true);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Pro and Enterprise plans');
      expect(mockStorage.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('handlePlanDowngrade', () => {
    it('should force footer visibility for downgrade to free', async () => {
      await EmailFooterService.handlePlanDowngrade(1, 'free');
      
      expect(mockStorage.updateUser).toHaveBeenCalledWith(1, {
        subscriptionPlan: 'free',
        hideEmailFooter: false,
      });
    });

    it('should only update plan for pro upgrade', async () => {
      await EmailFooterService.handlePlanDowngrade(1, 'pro');
      
      expect(mockStorage.updateUser).toHaveBeenCalledWith(1, {
        subscriptionPlan: 'pro',
      });
    });
  });
});