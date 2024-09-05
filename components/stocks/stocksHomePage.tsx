type StocksHomePageProps = {
    onStart: () => void
}

export function StocksHomePage(props: StocksHomePageProps) {
    return <div className="row">
        <div className="col d-flex justify-content-center">
            <div className="card">
                <div className="card-body">
                    <h1 className="card-title">Stocks Game</h1>
                    <p className="card-text">Are you willing to risk it all?</p>
                    <button className="btn btn-primary" onClick={props.onStart}>Risk It!</button>
                </div>
            </div>
        </div>
    </div>
}