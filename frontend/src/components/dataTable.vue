<script>
import { getServices, searchServices, getClients, searchClients, getEvents, searchEvents } from '../api/api'
import { useToast } from 'vue-toastification'

//Notifications
const toast = useToast()

export default {
    data() {
        return {

        }
    },
    mounted() {
        this.loadData();
    },
    methods: {
        // method called when component is mounted 
        async loadData() {
            this.searchBy = ''
            this.name = ''
            this.description = ''

            try {
                const response = await 
            }
        }
    }
    async handleSubmitForm() {
        // search 
    }
}

</script>