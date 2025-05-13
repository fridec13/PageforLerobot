import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 날짜를 yyyy-MM-dd HH:mm 형식으로 포맷팅합니다.
 * @param date - 포맷팅할 날짜
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 위키 문법을 HTML로 변환합니다. (나무위키 스타일 지원)
 * @param wikiText - 변환할 위키 문법 텍스트
 * @param previewMode - 미리보기 모드 여부 (선택적)
 * @returns 변환된 HTML
 */
export function parseWikiText(wikiText: string, previewMode: boolean = false): string {
  // 각주와 주석을 위한 수집 배열
  const footnotes: string[] = [];
  const comments: string[] = [];
  
  // [목차] 태그 처리
  wikiText = wikiText.replace(/\[목차\]/g, '<div id="wiki-toc-placeholder"></div>');
  
  // [clearfix] 태그 처리
  wikiText = wikiText.replace(/\[clearfix\]/g, '<div style="clear: both;"></div>');
  
  // 문서 분류 태그 처리
  wikiText = wikiText.replace(/\[\[분류:(.*?)\]\]/g, '<div class="wiki-category"><span class="text-gray-500">분류: </span><a href="/wiki/category/$1" class="text-blue-600 hover:underline">$1</a></div>');
  
  // 템플릿 포함 처리 (간단히 표시만 해줌)
  wikiText = wikiText.replace(/\[include\((.*?)\)\]/g, '<div class="bg-blue-50 border border-blue-200 p-2 my-2 rounded text-sm">템플릿 포함: $1</div>');
  
  // 색상 태그 처리
  wikiText = wikiText.replace(/\{\{\{#([a-zA-Z0-9]+)(,#[a-zA-Z0-9]+)?\s+(.*?)\}\}\}/g, 
    (match, color, bgColor, text) => {
      const style = `color: #${color}${bgColor ? `; background-color: ${bgColor.substring(1)}` : ''}`;
      return `<span style="${style}">${text}</span>`;
    }
  );
  
  // 폰트 크기 태그 처리
  wikiText = wikiText.replace(/\{\{\{\+([0-9]+)\s+(.*?)\}\}\}/g, 
    (match, size, text) => {
      return `<span style="font-size: ${1 + parseInt(size) * 0.1}em">${text}</span>`;
    }
  );
  
  wikiText = wikiText.replace(/\{\{\{\-([0-9]+)\s+(.*?)\}\}\}/g, 
    (match, size, text) => {
      return `<span style="font-size: ${1 - parseInt(size) * 0.1}em">${text}</span>`;
    }
  );
  
  // 나무위키 스타일 테이블 처리 - 기본 테이블
  wikiText = wikiText.replace(/\|\|<(.*?)>/g, '||<table-attr=$1>');
  
  wikiText = wikiText.replace(/\|\|(.*?)\|\|/g, (match, content) => {
    const cells = content.split('||');
    let tableHtml = '<table class="border-collapse w-full my-4 border">';
    let currentRow = '<tr>';
    
    cells.forEach((cell: string) => {
      if (cell.includes('<table-attr=')) {
        // 테이블 속성은 나중에 처리
        currentRow += `<td class="border p-2">${cell.replace('<table-attr=', '')}</td>`;
      } else {
        currentRow += `<td class="border p-2">${cell}</td>`;
      }
    });
    
    currentRow += '</tr>';
    tableHtml += currentRow + '</table>';
    return tableHtml;
  });
  
  // 목차 생성을 위한 제목들 추출
  const headings: { level: number; title: string; id: string }[] = [];
  const headingPattern1 = /^==\s*(.*?)\s*==$/gm;
  const headingPattern2 = /^===\s*(.*?)\s*===$/gm;
  const headingPattern3 = /^====\s*(.*?)\s*====$/gm;

  // 제목(h2) 추출
  let match;
  while ((match = headingPattern1.exec(wikiText)) !== null) {
    const title = match[1].trim();
    const id = title.toLowerCase().replace(/\s+/g, '-');
    headings.push({ level: 2, title, id });
  }

  // 소제목(h3) 추출
  while ((match = headingPattern2.exec(wikiText)) !== null) {
    const title = match[1].trim();
    const id = title.toLowerCase().replace(/\s+/g, '-');
    headings.push({ level: 3, title, id });
  }
  
  // 소소제목(h4) 추출
  while ((match = headingPattern3.exec(wikiText)) !== null) {
    const title = match[1].trim();
    const id = title.toLowerCase().replace(/\s+/g, '-');
    headings.push({ level: 4, title, id });
  }

  // 목차 HTML 생성
  let tocHtml = '';
  if (headings.length > 0) {
    tocHtml = '<div class="wiki-toc bg-gray-50 p-4 rounded-lg mb-6 mt-4"><h2 class="text-lg font-bold mb-2">목차</h2><ul>';
    headings.forEach(heading => {
      let indentClass = '';
      if (heading.level === 3) indentClass = 'ml-4';
      else if (heading.level === 4) indentClass = 'ml-8';
      
      tocHtml += `<li class="${indentClass}"><a href="#${heading.id}" class="text-blue-600 hover:underline">${heading.title}</a></li>`;
    });
    tocHtml += '</ul></div>';
  }

  // HTML 주석 처리 (<!-- 주석 내용 -->)
  // 이제 주석을 미주로 변환합니다
  let commentIndex = 0;
  wikiText = wikiText.replace(/<!--([\s\S]*?)-->/g, (match, content) => {
    commentIndex++;
    comments.push(content.trim());
    
    const commentHtml = `<sup class="wiki-comment text-blue-600 cursor-pointer" id="comment-ref-${commentIndex}" data-comment-id="${commentIndex}">[주${commentIndex}]</sup>`;
    return commentHtml;
  });
  
  // 각주 처리 ({{각주|텍스트}})
  let footnoteIndex = 0;
  let html = wikiText.replace(/\{\{각주\|(.*?)\}\}/g, (match, content) => {
    footnoteIndex++;
    footnotes.push(content.trim());
    
    const footnoteHtml = `<sup class="footnote-ref text-blue-600 cursor-pointer" id="footnote-ref-${footnoteIndex}" data-footnote-id="${footnoteIndex}">[${footnoteIndex}]</sup>`;
    return footnoteHtml;
  });

  // 여러 위키 문법 규칙들을 정규식으로 처리
  html = html
    // 굵은 글씨: '''텍스트'''
    .replace(/'''(.*?)'''/g, '<strong>$1</strong>')
    // 기울임: ''텍스트''
    .replace(/''(.*?)''/g, '<em>$1</em>')
    // 내부 링크: [[링크|텍스트]] 또는 [[링크]]
    .replace(/\[\[(.*?)(?:\|(.*?))?\]\]/g, (match, link, text) => {
      if (link.includes(':')) {
        // 특수 링크(분류 등)는 이미 위에서 처리했으므로 스킵
        return match;
      }
      const displayText = text || link;
      return `<a href="/wiki/${link.replace(/ /g, '_')}" class="text-blue-600 hover:underline">${displayText}</a>`;
    })
    // 제목: == 제목 ==
    .replace(/^==\s*(.*?)\s*==$/gm, (match, title) => {
      const id = title.toLowerCase().replace(/\s+/g, '-');
      return `<h2 class="text-2xl font-bold mt-6 mb-4 pb-2 border-b" id="${id}">${title}</h2>`;
    })
    // 소제목: === 소제목 ===
    .replace(/^===\s*(.*?)\s*===$/gm, (match, title) => {
      const id = title.toLowerCase().replace(/\s+/g, '-');
      return `<h3 class="text-xl font-bold mt-5 mb-3" id="${id}">${title}</h3>`;
    })
    // 소소제목: ==== 소소제목 ====
    .replace(/^====\s*(.*?)\s*====$/gm, (match, title) => {
      const id = title.toLowerCase().replace(/\s+/g, '-');
      return `<h4 class="text-lg font-semibold mt-4 mb-2" id="${id}">${title}</h4>`;
    })
    // 목록: * 항목
    .replace(/^\*\s*(.*?)$/gm, '<li class="ml-6 list-disc">$1</li>')
    // 코드 블럭: <code>코드</code>
    .replace(/<code>([\s\S]*?)<\/code>/g, '<pre class="bg-gray-100 p-2 my-2 overflow-x-auto rounded font-mono text-sm">$1</pre>');

  // 목록 항목을 ul 태그로 감싸기
  const listItemRegex = /<li class="ml-6 list-disc">(.*?)<\/li>/g;
  if (listItemRegex.test(html)) {
    html = html.replace(/(<li class="ml-6 list-disc">.*?<\/li>)+/g, match => {
      return '<ul class="my-3">' + match + '</ul>';
    });
  }

  // 줄바꿈 처리 (단, 이미 HTML 태그가 있는 경우 제외)
  html = html.replace(/\n{2,}/g, '</p><p class="my-2">');
  html = html.replace(/\n/g, '<br>');
  
  // 목차 삽입 - 목차 플레이스홀더가 있으면 거기에, 없으면 첫 번째 제목 앞에 삽입
  if (tocHtml) {
    const tocPlaceholder = html.indexOf('<div id="wiki-toc-placeholder"></div>');
    if (tocPlaceholder !== -1) {
      html = html.replace('<div id="wiki-toc-placeholder"></div>', tocHtml);
    } else {
      const firstHeadingIndex = html.indexOf('<h2');
      if (firstHeadingIndex !== -1) {
        html = html.slice(0, firstHeadingIndex) + tocHtml + html.slice(firstHeadingIndex);
      } else {
        html = tocHtml + html;
      }
    }
  }
  
  // 각주와 미주 목록 생성
  let referencesHtml = '';
  
  // 각주 목록 생성
  if (footnotes.length > 0) {
    referencesHtml += '<div class="wiki-footnotes mt-10 pt-6 border-t"><h3 class="text-xl font-bold mb-3">각주</h3><ol class="list-decimal pl-8">';
    footnotes.forEach((footnote, index) => {
      const num = index + 1;
      referencesHtml += `
        <li id="footnote-${num}" class="mb-2">
          <div class="flex items-start">
            <a href="#footnote-ref-${num}" class="text-blue-600 text-sm mr-2">↑</a>
            <div>${footnote}</div>
          </div>
        </li>`;
    });
    referencesHtml += '</ol></div>';
  }
  
  // 주석 목록 생성
  if (comments.length > 0) {
    referencesHtml += '<div class="wiki-comments mt-6"><h3 class="text-xl font-bold mb-3">미주</h3><ol class="list-decimal pl-8">';
    comments.forEach((comment, index) => {
      const num = index + 1;
      referencesHtml += `
        <li id="comment-${num}" class="mb-2">
          <div class="flex items-start">
            <a href="#comment-ref-${num}" class="text-blue-600 text-sm mr-2">↑</a>
            <div>${comment}</div>
          </div>
        </li>`;
    });
    referencesHtml += '</ol></div>';
  }
  
  // 본문과 미주/각주 조합
  const contentHtml = `<div class="wiki-content"><p class="my-2">${html}</p></div>`;
  
  return contentHtml + referencesHtml;
}
