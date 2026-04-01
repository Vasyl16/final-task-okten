import { AppProviders } from '@/app/providers/app-providers';
import { AppRouterProvider } from '@/app/router/router-provider';

function App() {
  return (
    <AppProviders>
      <AppRouterProvider />
    </AppProviders>
  );
}

export default App;
