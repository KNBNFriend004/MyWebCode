import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MarkdownRendererProps {
  text: string;
  textColor: string;
  secondaryColor: string;
  accentColor: string;
}

interface ParsedBlock {
  type: 'heading1' | 'heading2' | 'heading3' | 'bullet' | 'numbered' | 'paragraph';
  content: string;
  number?: number;
}

const parseBlocks = (text: string): ParsedBlock[] => {
  const lines = text.split('\n');
  const blocks: ParsedBlock[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: 'paragraph', content: currentParagraph.join('\n') });
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trimStart();

    if (trimmed.startsWith('### ')) {
      flushParagraph();
      blocks.push({ type: 'heading3', content: trimmed.slice(4) });
    } else if (trimmed.startsWith('## ')) {
      flushParagraph();
      blocks.push({ type: 'heading2', content: trimmed.slice(3) });
    } else if (trimmed.startsWith('# ')) {
      flushParagraph();
      blocks.push({ type: 'heading1', content: trimmed.slice(2) });
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      blocks.push({ type: 'bullet', content: trimmed.slice(2) });
    } else if (/^\d+\.\s/.test(trimmed)) {
      flushParagraph();
      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        blocks.push({ type: 'numbered', content: match[2], number: parseInt(match[1], 10) });
      }
    } else if (trimmed === '') {
      flushParagraph();
    } else {
      currentParagraph.push(line);
    }
  }

  flushParagraph();
  return blocks;
};

interface InlineSegment {
  text: string;
  bold: boolean;
}

const parseInline = (text: string): InlineSegment[] => {
  const segments: InlineSegment[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    segments.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), bold: false });
  }

  if (segments.length === 0) {
    segments.push({ text, bold: false });
  }

  return segments;
};

const InlineText: React.FC<{ content: string; style: object; boldFontWeight?: string }> = ({ content, style, boldFontWeight = '700' }) => {
  const segments = parseInline(content);
  return (
    <Text style={style}>
      {segments.map((seg, i) => (
        <Text key={i} style={seg.bold ? { fontWeight: boldFontWeight as any } : undefined}>
          {seg.text}
        </Text>
      ))}
    </Text>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  text,
  textColor,
  secondaryColor,
  accentColor,
}) => {
  const blocks = parseBlocks(text);

  return (
    <View>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading1':
            return (
              <InlineText
                key={index}
                content={block.content}
                style={[styles.heading1, { color: textColor }]}
                boldFontWeight="900"
              />
            );
          case 'heading2':
            return (
              <InlineText
                key={index}
                content={block.content}
                style={[styles.heading2, { color: textColor }]}
                boldFontWeight="800"
              />
            );
          case 'heading3':
            return (
              <InlineText
                key={index}
                content={block.content}
                style={[styles.heading3, { color: textColor }]}
                boldFontWeight="800"
              />
            );
          case 'bullet':
            return (
              <View key={index} style={styles.listItem}>
                <Text style={[styles.bullet, { color: accentColor }]}>{'\u2022'}</Text>
                <InlineText
                  content={block.content}
                  style={[styles.listText, { color: textColor }]}
                />
              </View>
            );
          case 'numbered':
            return (
              <View key={index} style={styles.listItem}>
                <Text style={[styles.numberedBullet, { color: accentColor }]}>
                  {block.number}.
                </Text>
                <InlineText
                  content={block.content}
                  style={[styles.listText, { color: textColor }]}
                />
              </View>
            );
          case 'paragraph':
          default:
            return (
              <InlineText
                key={index}
                content={block.content}
                style={[styles.paragraph, { color: textColor }]}
              />
            );
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  heading1: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    marginTop: 12,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    marginTop: 10,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '700',
  },
  listItem: {
    flexDirection: 'row',
    paddingLeft: 8,
    marginBottom: 6,
  },
  bullet: {
    fontSize: 18,
    lineHeight: 24,
    marginRight: 10,
    fontWeight: '700',
  },
  numberedBullet: {
    fontSize: 16,
    lineHeight: 24,
    marginRight: 8,
    fontWeight: '700',
    minWidth: 22,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
});

export default MarkdownRenderer;
