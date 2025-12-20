const CalculationResultComponent = {
    inject: ['linksService'],
    props: ['text'],
    template: `
        <div v-if="linksService.isEligible(text)"
             class="nc-result btn p-0 border-0"
             @click="$router.push(linksService.getRoute(text))">
            <span class="px-3 text-secondary display-1"
                  v-text="text">
            </span>
        </div>
        <div v-else
             class="nc-result px-3 text-secondary display-1"
             v-text="text">
        </div>
    `
};

export { CalculationResultComponent };
