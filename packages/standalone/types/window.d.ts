import { GeneratorConfig } from '@imerss/inat-curated-species-list-ui';

declare global {
  interface Window {
    initInatCuratedSpeciesList: (domElementId: string, config: GeneratorConfig) => void;
  }
}
