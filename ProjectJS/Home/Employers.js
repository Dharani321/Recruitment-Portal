  $(document).ready(function () {
            $("#featuresPanel").hide();


            setTimeout(showPanel, 2000);
        });

        function closePanel() {
            $("#featuresPanel").hide();
        }

        function showPanel() {
            $("#featuresPanel").css({ display: "block", opacity: 0 })
                .animate({ opacity: 1 }, 1000);
        }

      