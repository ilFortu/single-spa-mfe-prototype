const getTargetNode = (): HTMLElement => {
  const shadowRoot = (document.querySelector('#view-container>div') as HTMLElement).shadowRoot;
  return (
    shadowRoot ? shadowRoot.querySelector('#shadow-root-mount-point') : document.querySelector('#view-container')
  ) as HTMLElement;
};

const tableSetMaxHeight = (): void => {
  const mainContainer = getTargetNode();

  const dataTable = mainContainer?.querySelector('.table-scrollable') as HTMLElement | null;

  if (!mainContainer || !dataTable?.parentElement) return;

  const rect = dataTable.getBoundingClientRect();
  const heightFromTop = rect.top;

  const tableWrapper = dataTable.querySelector('.p-datatable-wrapper') as HTMLElement | null;
  const tabsWrapper = mainContainer.querySelector('.p-tabview-nav-container') as HTMLElement | null;
  const tabsViewPanels = mainContainer.querySelector('.p-tabview-panels') as HTMLElement | null;

  if (!tableWrapper?.parentElement) return;

  // Calculate total height of sibling elements
  const totalElementsHeight = Array.from(tableWrapper.parentElement.children)
    .filter(element => element !== tableWrapper)
    .reduce((total, element) => {
      const computedStyles = getComputedStyle(element);
      const elementMargin = parseFloat(computedStyles.marginTop) + parseFloat(computedStyles.marginBottom);
      return total + element.getBoundingClientRect().height + elementMargin;
    }, 0);

  // Get padding and margin sizes
  const mainContainerPaddingBottom = 30;
  const dataTableMarginTopBottom =
    parseFloat(getComputedStyle(dataTable).marginTop) + parseFloat(getComputedStyle(dataTable).marginBottom);

  // Calculate height of tabs if present
  const tabsNavHeight =
    tabsWrapper && tabsViewPanels
      ? tabsWrapper.getBoundingClientRect().height +
        parseFloat(getComputedStyle(tabsViewPanels).paddingTop) +
        parseFloat(getComputedStyle(tabsViewPanels).paddingBottom)
      : 0;

  // Calculate available height
  const availableHeight =
    window.innerHeight -
    (mainContainerPaddingBottom + dataTableMarginTopBottom + totalElementsHeight + heightFromTop + tabsNavHeight);

  // Set minimum max height to 450px
  const tableMaxHeight = Math.max(450, availableHeight);
  tableWrapper.style.maxHeight = `${tableMaxHeight}px`;
};

export class Table {
  private observer?: MutationObserver | null;

  public setupDOMObserver(): void {
    this.reset();
    const targetNode = getTargetNode();

    if (targetNode) {
      this.observer = new MutationObserver(() => this.setTableMaxHeight());
      this.observer.observe(targetNode, { subtree: true, childList: true });
      // Initialize the table max height when the observer starts
      this.setTableMaxHeight();
    }
  }

  private resizeHandler = (): void => tableSetMaxHeight();

  private setTableMaxHeight(): void {
    window.removeEventListener('resize', this.resizeHandler);
    window.addEventListener('resize', this.resizeHandler);
    tableSetMaxHeight();
  }

  private reset(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
