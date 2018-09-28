$('#snakes-animation-holder').append(`
  <a id="show-info-btn">
    <i class="material-icons small">info</i>
  </a>

  <div id="info-holder" class="card-panel invisible">
    <a id="hide-info-btn">
      <i class="material-icons">close</i>
    </a>

    <div id="charts-holder">
      <div id="fitness-chart-holder">
        <div class="charts">
          <canvas id="perfChart" width="210" height="210"></canvas>
        </div>
      </div>
    </div>
  </div>
  `)
