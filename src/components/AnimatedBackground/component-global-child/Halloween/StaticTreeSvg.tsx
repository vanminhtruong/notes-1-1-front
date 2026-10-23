import { useEffect, useRef, useState } from 'react';
import type { SVGProps } from 'react';

// These trees contain static paths only. Decode the exact SVG as an image so
// swaying its parent can reuse an image instead of repainting hundreds of paths.
export default function StaticTreeSvg(props: SVGProps<SVGSVGElement>) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    let cancelled = false;
    const markup = new XMLSerializer().serializeToString(svg);
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    const image = new Image();
    image.src = url;
    image.decode().then(() => {
      if (!cancelled) setSource(url);
    }).catch(() => {
      // Preserve the original vector if decoding or the site's CSP rejects it.
    });
    return () => { cancelled = true; };
  }, []);

  if (source) {
    return <img src={source} alt="" aria-hidden="true" draggable={false}
      className={props.className} width={props.width} height={props.height}
      style={{ display: 'block', ...(props.className ? {} : { width: '100%', height: 'auto' }), ...props.style }} />;
  }

  return <svg {...props} ref={svgRef} />;
}
