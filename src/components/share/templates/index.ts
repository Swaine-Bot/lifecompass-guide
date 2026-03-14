export { ClassicTemplate } from './ClassicTemplate';
export { StoryTemplate } from './StoryTemplate';
export { MinimalTemplate } from './MinimalTemplate';
export { MomentumTemplate } from './MomentumTemplate';
export { MediaSpotlightTemplate } from './MediaSpotlightTemplate';
export { ReflectionTemplate } from './ReflectionTemplate';
export { TEMPLATE_REGISTRY, suggestTemplate } from './types';
export type { ShareTemplateName, ShareTemplateProps, TemplateMetadata } from './types';

import type { ShareTemplateName } from './types';
import { ClassicTemplate } from './ClassicTemplate';
import { StoryTemplate } from './StoryTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { MomentumTemplate } from './MomentumTemplate';
import { MediaSpotlightTemplate } from './MediaSpotlightTemplate';
import { ReflectionTemplate } from './ReflectionTemplate';
import { HeroBentoLayout } from '../bento/HeroBentoLayout';
import { SplitBentoLayout } from '../bento/SplitBentoLayout';
import { ReflectionBentoLayout } from '../bento/ReflectionBentoLayout';
import { MinimalBentoLayout } from '../bento/MinimalBentoLayout';
import type { ShareTemplateProps } from './types';
import type { FC } from 'react';

export const TEMPLATE_COMPONENTS: Record<ShareTemplateName, FC<ShareTemplateProps>> = {
  classic: ClassicTemplate,
  story: StoryTemplate,
  minimal: MinimalTemplate,
  momentum: MomentumTemplate,
  media_spotlight: MediaSpotlightTemplate,
  reflection: ReflectionTemplate,
  bento_hero: HeroBentoLayout,
  bento_split: SplitBentoLayout,
  bento_reflection: ReflectionBentoLayout,
  bento_minimal: MinimalBentoLayout,
};
