/**
 * JobTable Component Tests
 * Tests rendering, loading states, and job list display
 */

import { describe, it, expect, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/__tests__/utils/render';
import { JobTable } from '../JobTable';
import { mockJobs } from '@/__tests__/mocks/data';

describe('JobTable', () => {
  describe('Rendering', () => {
    it('renders table element', () => {
      renderWithProviders(<JobTable jobs={mockJobs} />, {
        initialEntries: ['/ge'],
      });
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('renders table headers in Georgian by default', () => {
      renderWithProviders(<JobTable jobs={mockJobs} />, {
        initialEntries: ['/ge'],
      });
      expect(screen.getByText('განცხადება')).toBeInTheDocument();
      expect(screen.getByText('კომპანია')).toBeInTheDocument();
    });

    it('renders table headers in English when language is en', () => {
      renderWithProviders(<JobTable jobs={mockJobs} />, {
        initialEntries: ['/en'],
      });
      expect(screen.getByText('Job Title')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
    });
  });

  describe('Job Display', () => {
    it('renders job rows for each job', () => {
      renderWithProviders(<JobTable jobs={mockJobs} />, {
        initialEntries: ['/en'],
      });

      // Check that job titles are rendered
      expect(screen.getByText('Software Developer')).toBeInTheDocument();
      expect(screen.getByText('UI Designer')).toBeInTheDocument();
      expect(screen.getByText('Marketing Manager')).toBeInTheDocument();
    });

    it('renders company names', () => {
      renderWithProviders(<JobTable jobs={mockJobs} />, {
        initialEntries: ['/en'],
      });

      expect(screen.getByText('TechCorp')).toBeInTheDocument();
      expect(screen.getByText('DesignHub')).toBeInTheDocument();
      expect(screen.getByText('MarketPro')).toBeInTheDocument();
    });

    it('renders job titles in Georgian when language is ge', () => {
      renderWithProviders(<JobTable jobs={mockJobs} />, {
        initialEntries: ['/ge'],
      });

      expect(screen.getByText('პროგრამისტი')).toBeInTheDocument();
      expect(screen.getByText('დიზაინერი')).toBeInTheDocument();
      expect(screen.getByText('მარკეტოლოგი')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows skeleton rows when loading', () => {
      renderWithProviders(<JobTable jobs={[]} isLoading={true} skeletonCount={5} />, {
        initialEntries: ['/ge'],
      });

      // Check for skeleton rows in tbody
      const tbody = screen.getByRole('table').querySelector('tbody');
      expect(tbody).toBeInTheDocument();

      // Should have 5 skeleton rows
      const rows = tbody!.querySelectorAll('tr');
      expect(rows.length).toBe(5);
    });

    it('uses default skeleton count of 10', () => {
      renderWithProviders(<JobTable jobs={[]} isLoading={true} />, {
        initialEntries: ['/ge'],
      });

      const tbody = screen.getByRole('table').querySelector('tbody');
      const rows = tbody!.querySelectorAll('tr');
      expect(rows.length).toBe(10);
    });

    it('does not show jobs when loading', () => {
      renderWithProviders(<JobTable jobs={mockJobs} isLoading={true} />, {
        initialEntries: ['/en'],
      });

      expect(screen.queryByText('Software Developer')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders empty table body when no jobs and not loading', () => {
      renderWithProviders(<JobTable jobs={[]} />, {
        initialEntries: ['/ge'],
      });

      const tbody = screen.getByRole('table').querySelector('tbody');
      expect(tbody).toBeInTheDocument();
      expect(tbody!.children.length).toBe(0);
    });
  });

  describe('Interactions', () => {
    it('calls onJobClick when a job row is clicked', async () => {
      const user = userEvent.setup();
      const onJobClick = vi.fn();

      renderWithProviders(
        <JobTable jobs={mockJobs} onJobClick={onJobClick} />,
        { initialEntries: ['/en'] }
      );

      // Find the first job row and click it
      const firstJobTitle = screen.getByText('Software Developer');
      const row = firstJobTitle.closest('tr');

      if (row) {
        await user.click(row);
        expect(onJobClick).toHaveBeenCalledWith(mockJobs[0], 0);
      }
    });

    it('calls onJobClick with correct job and index', async () => {
      const user = userEvent.setup();
      const onJobClick = vi.fn();

      renderWithProviders(
        <JobTable jobs={mockJobs} onJobClick={onJobClick} />,
        { initialEntries: ['/en'] }
      );

      // Click the second job
      const secondJobTitle = screen.getByText('UI Designer');
      const row = secondJobTitle.closest('tr');

      if (row) {
        await user.click(row);
        expect(onJobClick).toHaveBeenCalledWith(mockJobs[1], 1);
      }
    });
  });

  describe('Accessibility', () => {
    it('has role="table" attribute', () => {
      renderWithProviders(<JobTable jobs={mockJobs} />, {
        initialEntries: ['/ge'],
      });

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('has proper scope="col" on header cells', () => {
      renderWithProviders(<JobTable jobs={mockJobs} />, {
        initialEntries: ['/ge'],
      });

      const headers = screen.getAllByRole('columnheader');
      headers.forEach((header) => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });
  });

  describe('Custom ClassName', () => {
    it('accepts custom className', () => {
      const { container } = renderWithProviders(
        <JobTable jobs={mockJobs} className="custom-table-class" />,
        { initialEntries: ['/ge'] }
      );

      const wrapper = container.querySelector('.custom-table-class');
      expect(wrapper).toBeInTheDocument();
    });
  });
});
