import { BuilderState } from '../state/BuilderState';
import { BuilderToolbar } from '../toolbar/BuilderToolbar';
import { BuilderSidebar } from '../sidebar/BuilderSidebar';
import { BuilderCanvas } from '../canvas/BuilderCanvas';
import { BuilderPropertiesPanel } from '../properties/BuilderPropertiesPanel';
import { PageSchema } from '../../shared/schemas/page.types';
import { EventEmitter } from '../../shared/events/EventEmitter';
import { DomUtils } from '../../shared/utils/domUtils';

export class PageBuilderApp {
  public state: BuilderState;
  public element: HTMLElement;
  public toolbar: BuilderToolbar;
  public sidebar: BuilderSidebar;
  public canvas: BuilderCanvas;
  public propertiesPanel: BuilderPropertiesPanel;

  constructor(initialPage: PageSchema, emitter: EventEmitter) {
    this.state = new BuilderState(initialPage, emitter);
    this.element = DomUtils.createElement('div', 'page-builder-root');

    this.toolbar = new BuilderToolbar(this.state);
    this.sidebar = new BuilderSidebar(this.state);
    this.canvas = new BuilderCanvas(this.state);
    this.propertiesPanel = new BuilderPropertiesPanel(this.state);

    this.assemble();
  }

  private assemble(): void {
    this.element.appendChild(this.toolbar.element);

    const workspace = DomUtils.createElement('div', 'builder-workspace');
    workspace.appendChild(this.sidebar.element);
    workspace.appendChild(this.canvas.element);
    workspace.appendChild(this.propertiesPanel.element);

    this.element.appendChild(workspace);

    // Initial populate
    this.sidebar.updateTree();
    this.propertiesPanel.updatePanel();
  }

  public mount(target: HTMLElement): void {
    target.innerHTML = '';
    target.appendChild(this.element);
  }
}

