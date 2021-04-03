import { t } from "@lingui/macro";
import { css, CSSResult, customElement, html, LitElement, property, TemplateResult } from "lit-element";
import { EventsApi, Notification } from "authentik-api";
import { AKResponse } from "../../api/Client";
import { DEFAULT_CONFIG } from "../../api/Config";
import PFBase from "@patternfly/patternfly/patternfly-base.css";
import PFNotificationDrawer from "@patternfly/patternfly/components/NotificationDrawer/notification-drawer.css";
import PFDropdown from "@patternfly/patternfly/components/Dropdown/dropdown.css";
import AKGlobal from "../../authentik.css";
import PFContent from "@patternfly/patternfly/components/Content/content.css";

@customElement("ak-notification-drawer")
export class NotificationDrawer extends LitElement {

    @property({attribute: false})
    notifications?: AKResponse<Notification>;

    @property({type: Number})
    unread = 0;

    static get styles(): CSSResult[] {
        return [PFBase, PFNotificationDrawer, PFContent, PFDropdown, AKGlobal].concat(
            css`
                .pf-c-notification-drawer__header {
                    height: 114px;
                    padding: var(--pf-c-page__main-section--PaddingTop) var(--pf-c-page__main-section--PaddingRight) var(--pf-c-page__main-section--PaddingBottom) var(--pf-c-page__main-section--PaddingLeft);
                    display: flex;
                    flex-direction: column;
                }
                .pf-c-notification-drawer__list-item-description {
                    white-space: pre-wrap;
                }
            `
        );
    }

    firstUpdated(): void {
        new EventsApi(DEFAULT_CONFIG).eventsNotificationsList({
            seen: "false",
            ordering: "-created",
        }).then(r => {
            this.notifications = r;
            this.unread = r.results.length;
        });
    }

    renderItem(item: Notification): TemplateResult {
        let level = "";
        switch (item.severity) {
        case "notice":
            level = "pf-m-info";
            break;
        case "warning":
            level = "pf-m-warning";
            break;
        case "alert":
            level = "pf-m-danger";
            break;
        default:
            break;
        }
        return html`<li class="pf-c-notification-drawer__list-item pf-m-read">
            <div class="pf-c-notification-drawer__list-item-header">
                <span class="pf-c-notification-drawer__list-item-header-icon ${level}">
                    <i class="fas fa-info-circle" aria-hidden="true"></i>
                </span>
                <h2 class="pf-c-notification-drawer__list-item-header-title">
                    ${item.event?.action}
                </h2>
            </div>
            <div class="pf-c-notification-drawer__list-item-action">
                ${item.event && html`
                    <a class="pf-c-dropdown__toggle pf-m-plain" href="#/events/log/${item.event?.pk}">
                        <i class="fas fas fa-share-square"></i>
                    </a>
                `}
                <button class="pf-c-dropdown__toggle pf-m-plain" type="button" @click=${() => {
                    new EventsApi(DEFAULT_CONFIG).eventsNotificationsPartialUpdate({
                        uuid: item.pk || "",
                        data: {
                            seen: true,
                        }
                    }).then(() => {
                        this.firstUpdated();
                    });
                }}>
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <p class="pf-c-notification-drawer__list-item-description">${item.body}</p>
            <small class="pf-c-notification-drawer__list-item-timestamp">${item.created?.toLocaleString()}</small>
        </li>`;
    }

    render(): TemplateResult {
        if (!this.notifications) {
            return html``;
        }
        return html`<div class="pf-c-drawer__body pf-m-no-padding">
            <div class="pf-c-notification-drawer">
                <div class="pf-c-notification-drawer__header pf-c-content">
                    <h1>
                        ${t`Notifications`}
                    </h1>
                    <p>
                        ${t`${this.unread} unread`}
                    </p>
                </div>
                <div class="pf-c-notification-drawer__body">
                    <ul class="pf-c-notification-drawer__list">
                        ${this.notifications.results.map(n => this.renderItem(n))}
                    </ul>
                </div>
            </div>
        </div>`;
    }

}
