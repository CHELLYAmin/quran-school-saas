import HeroBlock from './blocks/HeroBlock';
import RichTextBlock from './blocks/RichTextBlock';
import HubBlock from './blocks/HubBlock';

export interface Block {
    type: string;
    data: any;
}

export default function BlockRenderer({ blocksJson }: { blocksJson?: string }) {
    if (!blocksJson) return null;
    
    try {
        const blocks: Block[] = JSON.parse(blocksJson);
        return (
            <div className="space-y-0">
                {blocks.map((block, i) => {
                    switch (block.type) {
                        case 'hero': return <HeroBlock key={i} data={block.data} />;
                        case 'rich-text': return <RichTextBlock key={i} data={block.data} />;
                        case 'hub': return <HubBlock key={i} data={block.data} />;
                        default: return null;
                    }
                })}
            </div>
        );
    } catch (e) {
        console.error('Error rendering blocks', e);
        return null;
    }
}
