import { ArrowUpRight } from 'lucide-react';
import { features } from '../content';
export function FeatureCards({ onSelect }: { onSelect: (chapter: number) => void }) {
 return <div className="feature-grid">{features.map((f,i)=><button className="feature-card glass" key={f.label} onClick={()=>onSelect(f.chapter)}><div className="card-top"><f.icon size={23} strokeWidth={1.3}/><span>{String(i+1).padStart(2,'0')} / {f.label}</span><ArrowUpRight className="card-arrow" size={17}/></div><h2>{f.title}</h2><p>{f.text}</p></button>)}</div>;
}
