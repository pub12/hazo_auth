// file_description: jest global setup
import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextEncoder, TextDecoder });

// Mock Next.js navigation hooks for App Router components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => {
      // Return null for token to trigger immediate error state in email verification tests
      if (key === 'token') return null;
      if (key === 'email') return null;
      return null;
    },
    getAll: () => [],
    has: () => false,
    toString: () => '',
  }),
  usePathname: () => '/test-path',
  useParams: () => ({}),
}));

// Mock HazoAuthProvider context
jest.mock('@/contexts/hazo_auth_provider', () => ({
  useHazoAuthConfig: () => ({
    apiBasePath: '/api/hazo_auth',
  }),
  HazoAuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
