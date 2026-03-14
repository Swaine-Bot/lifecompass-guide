import type { ShareTemplateProps } from '../templates/types';
import { AdaptiveBentoTemplate } from './AdaptiveBentoTemplate';

export function HeroBentoLayout(props: ShareTemplateProps) {
  return <AdaptiveBentoTemplate baseVariant="hero" {...props} />;
}
