import { cloneNode } from './clone-node'
import { Options } from './types'

export const createIframe = (windowWidth: number) => {
  const iframe = document.createElement('iframe')
  iframe.width = `${windowWidth}px`
  iframe.style.visibility = 'hidden'
  iframe.style.position = 'fixed'
  iframe.style.left = '-10000px'
  iframe.style.top = '0px'
  iframe.style.border = '0'
  iframe.name = 'clone-element-helper'
  const iframeElement = document.body.appendChild(iframe)
  return iframeElement
}

export const cloneDocumentStylesIntoIframe = (iframe: HTMLIFrameElement) => {
  const documentStyles = [...Array.from(document.styleSheets)]
    .map((styleSheet) => {
      try {
        return [...Array.from(styleSheet.cssRules)]
          .map((rule) => rule.cssText)
          .join('')
      } catch (e) {
        console.log(
          'Access to stylesheet %s is denied. Ignoring...',
          styleSheet.href,
        )
      }
    })
    .filter(Boolean)
    .join('\n')

  const styles = document.createElement('style')
  styles.textContent = documentStyles
  iframe?.contentDocument?.head.appendChild(styles)
}

export const cloneElementWithMediaQuery = async (
  el: HTMLElement,
  html2ImageOptions: Options,
) => {
  const windowWidth = html2ImageOptions.windowWidth || 1280
  const iframe = createIframe(windowWidth)
  const elementContainer = document.createElement('div')
  const elCopy = await cloneNode(el, {}, true)
  elementContainer.appendChild(elCopy as HTMLElement)

  const iframeDoc = iframe?.contentWindow?.document as Document
  iframeDoc.open()
  iframeDoc.write(elementContainer.innerHTML)
  iframeDoc.close()
  iframe.height = `${iframeDoc.body.scrollHeight}px`

  cloneDocumentStylesIntoIframe(iframe)

  const clonedElement = iframeDoc.body.firstElementChild as HTMLElement
  if (html2ImageOptions.onClone) {
    html2ImageOptions.onClone(clonedElement)
  }
  return clonedElement
}
