import { store } from "../main.js";
import { embed, getFontColour } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchSupporters, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "owner-dark",
    coowner: "crown-dark",
    admin: "user-gear-dark",
    helper: "user-shield-dark",
    dev: "code-dark",
    trial: "user-lock-dark",
    patreon: "patreon-dark",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 <= 999" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !level }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <div class="packs" v-if="level.packs.length > 0">
                        <div v-for="pack in level.packs" class="tag" :style="{background:pack.colour}">
                            <p>{{pack.name}}</p>
                        </div>
                    </div>
                    <iframe class="video" :src="embed(level.verification)" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify, list.length) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Password</div>
                            <p>{{ level.password || 'Free to Copy' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 150"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
                    <p v-else>100% or better to qualify</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}Hz</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Original List by <a href="https://tsl.pages.dev/#/" target="_blank">TheShittyList</a></p>
                    </div>
                    <template v-if="editors">
                        <h3 align="center">List Editors</h3>
                        <ol class="editors">
                            <ol class="rank" v-for="rank in editors">
                                <li v-for="member in rank.members">
                                    <img :src="\`/assets/\${roleIconMap[rank.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="rank.role">
                                    <a v-if="member.link" class="type-label-lg link" target="_blank" :href="member.link">{{ member.name }}</a>
                                    <p v-else>{{ member.name }}</p>
                                </li>
                            </ol>
                        </ol>
                        <h3 align="center">Supporters</h3>
                        <ol class="editors">
                            <ol class="rank" v-for="rank in supporters">
                                <li v-for="member in rank.members">
                                    <img :src="\`/assets/\${roleIconMap[rank.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="rank.role">
                                    <a v-if="member.link" class="type-label-lg link" target="_blank" :href="member.link">{{ member.name }}</a>
                                    <p v-else>{{ member.name }}</p>
                                </li>
                            </ol>
                        </ol>
                    </template>
                     <h3>> How to Submit Records</h3>
                    <p>
                        Click on the form button next to the Discord button and fill out the form.
                    </p>
                    <h3>> Submission Requirements</h3>
                    <p>
                        When submitting your record, please ensure that it complies with the following guidelines:
                    </p>
                    <p>
                        - The verification/completion video must be 0-100 with no cuts. You must include rhe previous few death attempts, and if the level is completed on first attempt, footage of opening up the GDPS is also needed.
                    </p>
                     <p>
                        - Levels that are top 20 in the list needs clicks for the whole video. (mobile is also included)
                    </p>
                    <p>
                        - The verification/completion must be done on the same level as the one submitted on the list, same ID (no modifications).
                    </p>
                    <p>
                        - Secret ways, bugged routes or cheating is obviously not allowed.
                    </p>
                    <p>
                        - Cheat Indicator, CPS, TPS/FPS Counter is required if you are using a mod menu such as MHv8.
                    </p>
                    <p>
                        - Physics bypass or legacy physics is not allowed.
                    </p>
                    <p>
                        - The end stat box must be viewable on the screen for atleast a second.
                    </p>
                    <p>
                        - You always need handcam for every level that is listed as "(Solo)" on the list.
                    </p>
                    <p>
                        - Refer to <a href="https://docs.google.com/spreadsheets/d/1SIWiG3HTlKbBxMPCAw-Wo5D2MORXXmV3kGKozE7Ep48/edit?usp=sharing">-This Sheet-</a> for a list of allowed and disallowed hacks
                    </p>
                    <h3>> Why was my record denied?</h3>
                    <p>
                        If your record was denied, please check the following:
                    </p>
                    <p>
                        Does the video meet the requirements? (Above)
                    </p>
                    <p>
                        Is the level placed on the list? (#pending-changes)
                    </p>
                    <p>
                        Was the submission command filled out correctly?
                    </p>
                    <p>
                        Was the record submitted with several links?
                    </p>
                    <p>
                        Note: You will be pinged in #records with the reason why your record was denied. If you are still unsure of why it was denied, or if the record was wrongfully denied, please make a post in #support or DM any list staff on Discord
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        supporters: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store,
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
        },
    },
    async mounted() {
        this.list = await fetchList();
        this.editors = await fetchEditors();
        this.supporters = await fetchSupporters();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
            if (!this.supporters) {
                this.errors.push("Failed to load supporters.");
            }
        }

        // Hide loading spinner
        this.loading = false;
    },
    methods: {
        embed,
        score,
        getFontColour,
    },
};
