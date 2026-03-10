import React from 'react';

export default function RichTextBlock({ data }: { data: any }) {
    return (
        <section className="py-24 bg-pearl dark:bg-dark-950/20">
            <div className="max-w-4xl mx-auto px-6">
                {data.title && (
                    <div className="mb-14 text-center">
                        <span className="w-12 h-1 bg-accent-gold inline-block mb-4 rounded-full" />
                        <h2 className="text-3xl md:text-5xl font-serif font-black text-primary-900 dark:text-white cinzel-title leading-tight">
                            {data.title}
                        </h2>
                    </div>
                )}
                
                <div className="prose prose-lg md:prose-xl prose-emerald dark:prose-invert max-w-none 
                    prose-headings:font-serif prose-headings:font-black prose-headings:cinzel-title 
                    prose-p:text-dark-900/70 dark:prose-p:text-pearl/60 prose-p:leading-relaxed prose-p:font-medium
                    prose-strong:text-primary-900 dark:prose-strong:text-white prose-strong:font-black
                    prose-a:text-accent-gold prose-a:underline-offset-4 prose-a:decoration-2
                    prose-img:rounded-[2rem] prose-img:shadow-2xl shadow-black/10
                    prose-blockquote:border-l-4 prose-blockquote:border-accent-gold prose-blockquote:bg-accent-gold/5 prose-blockquote:p-8 prose-blockquote:rounded-r-3xl prose-blockquote:italic"
                >
                    <div dangerouslySetInnerHTML={{ __html: data.content }} />
                </div>
            </div>
        </section>
    );
}
