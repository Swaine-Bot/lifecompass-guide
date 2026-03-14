import type { ShareTemplateProps } from '../templates/types';
import { AdaptiveBentoTemplate } from './AdaptiveBentoTemplate';

export function ReflectionBentoLayout(props: ShareTemplateProps) {
  return <AdaptiveBentoTemplate baseVariant="reflection" {...props} />;
}
