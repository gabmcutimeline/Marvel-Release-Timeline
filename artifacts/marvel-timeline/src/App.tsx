import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import AgentsOfShield from './pages/AgentsOfShield';
import PreMCU from './pages/PreMCU';
import Connections from './pages/Connections';
import ConnectionsList from './pages/ConnectionsList';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import Home from './pages/Home';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/agents-of-shield" component={AgentsOfShield} />  {/* ← cette ligne, AVANT la route NotFound */}
      <Route path="/hors-mcu" component={PreMCU} />
      <Route path="/connexions" component={ConnectionsList} />
      <Route path="/connexions-carte" component={Connections} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
