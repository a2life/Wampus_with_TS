export const StartOver = (props:{handler:(e:Event)=>void}) => {

    return (
        <>
            <button type="button" class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#start-over">
                Start Over
            </button>


            <div class="modal fade " id="start-over" aria-labelledby="start-over-label" aria-hidden="true">
                <div class="modal-dialog modal-sm">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Start Over</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            Same Set-up?
                        </div>

                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onClick={props.handler} value="Yes">Yes</button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" onClick={props.handler} value="No">No</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )

}